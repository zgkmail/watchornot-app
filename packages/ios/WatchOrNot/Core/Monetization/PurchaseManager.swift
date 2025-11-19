//
//  PurchaseManager.swift
//  WatchOrNot
//
//  Manages in-app purchases using StoreKit 2.
//  Handles "Remove Ads" one-time purchase and restoration.
//

import Foundation
import StoreKit
import Combine

/// Errors that can occur during purchase operations
enum PurchaseError: Error, LocalizedError {
    case productNotFound
    case purchaseFailed
    case verificationFailed
    case unknown

    var errorDescription: String? {
        switch self {
        case .productNotFound:
            return "Product not found in App Store"
        case .purchaseFailed:
            return "Purchase failed. Please try again."
        case .verificationFailed:
            return "Could not verify purchase"
        case .unknown:
            return "An unknown error occurred"
        }
    }
}

/// Result of a purchase attempt
enum PurchaseResult {
    case success
    case cancelled
    case pending
    case failed(Error)
}

/// Singleton manager for handling in-app purchases
@MainActor
class PurchaseManager: ObservableObject {
    static let shared = PurchaseManager()

    // MARK: - Published Properties

    /// Whether a purchase is currently in progress
    @Published private(set) var isPurchasing: Bool = false

    /// Whether products are being loaded
    @Published private(set) var isLoadingProducts: Bool = false

    /// Available products from the App Store
    @Published private(set) var products: [Product] = []

    // MARK: - Product IDs

    /// Product ID for "Remove Ads" non-consumable purchase
    static let removeAdsProductID = "com.watchornot.removeads"

    // MARK: - Private Properties

    private var updateListenerTask: Task<Void, Error>?
    private let adManager = AdManager.shared

    // MARK: - Initialization

    private init() {
        // Start listening for transaction updates
        updateListenerTask = listenForTransactions()
    }

    deinit {
        updateListenerTask?.cancel()
    }

    // MARK: - Public Methods

    /// Load available products from the App Store
    func loadProducts() async {
        guard products.isEmpty else { return }

        isLoadingProducts = true
        defer { isLoadingProducts = false }

        do {
            let products = try await Product.products(for: [Self.removeAdsProductID])
            self.products = products
            print("✅ Loaded \(products.count) product(s)")
        } catch {
            print("❌ Failed to load products: \(error)")
        }
    }

    /// Purchase the "Remove Ads" product
    func purchaseRemoveAds() async -> PurchaseResult {
        // Load products if not already loaded
        if products.isEmpty {
            await loadProducts()
        }

        guard let product = products.first(where: { $0.id == Self.removeAdsProductID }) else {
            return .failed(PurchaseError.productNotFound)
        }

        isPurchasing = true
        defer { isPurchasing = false }

        do {
            let result = try await product.purchase()

            switch result {
            case .success(let verification):
                // Verify the transaction
                let transaction = try checkVerified(verification)

                // Unlock ad-free experience
                adManager.markAdRemovalPurchased()

                // Finish the transaction
                await transaction.finish()

                print("✅ Purchase successful: \(transaction.productID)")
                return .success

            case .userCancelled:
                print("ℹ️ User cancelled purchase")
                return .cancelled

            case .pending:
                print("⏳ Purchase pending (awaiting approval)")
                return .pending

            @unknown default:
                return .failed(PurchaseError.unknown)
            }
        } catch {
            print("❌ Purchase failed: \(error)")
            return .failed(error)
        }
    }

    /// Restore previous purchases
    func restorePurchases() async -> Bool {
        var restored = false

        // Iterate through all transactions for the current user
        for await result in Transaction.currentEntitlements {
            do {
                let transaction = try checkVerified(result)

                if transaction.productID == Self.removeAdsProductID {
                    // Restore ad removal
                    adManager.restoreAdRemovalPurchase()
                    restored = true
                    print("✅ Restored purchase: \(transaction.productID)")
                }
            } catch {
                print("❌ Failed to verify transaction: \(error)")
            }
        }

        return restored
    }

    // MARK: - Private Methods

    /// Listen for transaction updates
    private func listenForTransactions() -> Task<Void, Error> {
        return Task.detached {
            for await result in Transaction.updates {
                do {
                    let transaction = try self.checkVerified(result)

                    // Handle the transaction update
                    await self.handleTransactionUpdate(transaction)

                    // Finish the transaction
                    await transaction.finish()
                } catch {
                    print("❌ Transaction verification failed: \(error)")
                }
            }
        }
    }

    /// Handle a transaction update
    private func handleTransactionUpdate(_ transaction: Transaction) async {
        if transaction.productID == Self.removeAdsProductID {
            await MainActor.run {
                adManager.markAdRemovalPurchased()
            }
        }
    }

    /// Verify a transaction result
    private func checkVerified<T>(_ result: VerificationResult<T>) throws -> T {
        switch result {
        case .unverified:
            throw PurchaseError.verificationFailed
        case .verified(let safe):
            return safe
        }
    }
}

// MARK: - Product Extensions

extension Product {
    /// Formatted display price (e.g., "$4.99")
    var displayPrice: String {
        return displayPrice
    }
}
