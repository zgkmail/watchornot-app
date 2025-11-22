//
//  CameraView.swift
//  WatchOrNot
//
//  Custom camera view optimized for capturing TV screens from sofa distance (2-4 meters)
//

import SwiftUI
import AVFoundation

struct CameraView: View {
    let onCapture: (UIImage) -> Void
    @Environment(\.dismiss) var dismiss
    @StateObject private var cameraManager = CameraManager()

    var body: some View {
        ZStack {
            // Camera preview
            CameraPreviewView(session: cameraManager.session)
                .ignoresSafeArea()

            // Frame guide overlay
            FrameGuideOverlay()

            // Camera controls
            VStack {
                // Top bar with close button
                HStack {
                    Button {
                        dismiss()
                    } label: {
                        Image(systemName: "xmark")
                            .font(.title2)
                            .foregroundColor(.white)
                            .padding(12)
                            .background(Color.black.opacity(0.5))
                            .clipShape(Circle())
                    }
                    .padding()

                    Spacer()
                }

                Spacer()

                // Distance preset buttons
                VStack(spacing: 12) {
                    Text("TV Distance")
                        .font(.caption)
                        .foregroundColor(.white)
                        .padding(.horizontal, 16)
                        .padding(.vertical, 6)
                        .background(Color.black.opacity(0.5))
                        .cornerRadius(8)

                    HStack(spacing: 16) {
                        DistancePresetButton(
                            title: "2m\nClose",
                            isSelected: cameraManager.currentPreset == .close,
                            action: { cameraManager.setDistancePreset(.close) }
                        )

                        DistancePresetButton(
                            title: "3m\nNormal",
                            isSelected: cameraManager.currentPreset == .normal,
                            action: { cameraManager.setDistancePreset(.normal) }
                        )

                        DistancePresetButton(
                            title: "4m\nFar",
                            isSelected: cameraManager.currentPreset == .far,
                            action: { cameraManager.setDistancePreset(.far) }
                        )
                    }
                    .padding(.horizontal, 24)
                }
                .padding(.bottom, 16)

                // Zoom slider
                VStack(spacing: 8) {
                    HStack {
                        Image(systemName: "minus.magnifyingglass")
                            .foregroundColor(.white)

                        Slider(
                            value: $cameraManager.zoomFactor,
                            in: 1.0...cameraManager.maxZoomFactor,
                            onEditingChanged: { editing in
                                if !editing {
                                    cameraManager.applyZoom()
                                }
                            }
                        )
                        .accentColor(.white)
                        .onChange(of: cameraManager.zoomFactor) { _ in
                            cameraManager.applyZoom()
                        }

                        Image(systemName: "plus.magnifyingglass")
                            .foregroundColor(.white)
                    }
                    .padding(.horizontal, 24)

                    Text(String(format: "%.1fx zoom", cameraManager.zoomFactor))
                        .font(.caption)
                        .foregroundColor(.white)
                        .padding(.horizontal, 16)
                        .padding(.vertical, 4)
                        .background(Color.black.opacity(0.5))
                        .cornerRadius(6)
                }
                .padding(.bottom, 16)

                // Capture button
                Button {
                    cameraManager.capturePhoto { image in
                        if let image = image {
                            onCapture(image)
                            dismiss()
                        }
                    }
                } label: {
                    ZStack {
                        Circle()
                            .fill(Color.white)
                            .frame(width: 70, height: 70)

                        Circle()
                            .stroke(Color.white, lineWidth: 3)
                            .frame(width: 84, height: 84)
                    }
                }
                .padding(.bottom, 32)
            }
        }
        .onAppear {
            cameraManager.startSession()
        }
        .onDisappear {
            cameraManager.stopSession()
        }
    }
}

// MARK: - Distance Preset Button
struct DistancePresetButton: View {
    let title: String
    let isSelected: Bool
    let action: () -> Void

    var body: some View {
        Button(action: action) {
            Text(title)
                .font(.caption)
                .fontWeight(isSelected ? .bold : .regular)
                .foregroundColor(.white)
                .multilineTextAlignment(.center)
                .frame(maxWidth: .infinity)
                .padding(.vertical, 12)
                .background(
                    Group {
                        if isSelected {
                            LinearGradient(
                                colors: [Color.blue, Color.purple],
                                startPoint: .leading,
                                endPoint: .trailing
                            )
                            .opacity(0.9)
                        } else {
                            Color.black.opacity(0.5)
                        }
                    }
                )
                .cornerRadius(12)
                .overlay(
                    RoundedRectangle(cornerRadius: 12)
                        .stroke(isSelected ? Color.white.opacity(0.5) : Color.clear, lineWidth: 2)
                )
        }
    }
}

// MARK: - Frame Guide Overlay
struct FrameGuideOverlay: View {
    var body: some View {
        GeometryReader { geometry in
            let width = geometry.size.width * 0.85
            let height = geometry.size.height * 0.5

            ZStack {
                // Dimmed background
                Color.black.opacity(0.3)
                    .ignoresSafeArea()

                // Clear rectangle for framing
                Rectangle()
                    .fill(Color.clear)
                    .frame(width: width, height: height)
                    .overlay(
                        RoundedRectangle(cornerRadius: 12)
                            .stroke(Color.white, lineWidth: 2)
                    )
                    .overlay(
                        // Corner brackets
                        CornerBrackets(width: width, height: height)
                    )
                    .blendMode(.destinationOut)
            }
            .compositingGroup()

            // Helper text
            VStack {
                Spacer()
                    .frame(height: (geometry.size.height - height) / 2 - 60)

                Text("Frame the TV screen within the guides")
                    .font(.caption)
                    .foregroundColor(.white)
                    .padding(.horizontal, 16)
                    .padding(.vertical, 8)
                    .background(Color.black.opacity(0.7))
                    .cornerRadius(8)

                Spacer()
            }
            .frame(maxWidth: .infinity)
        }
    }
}

// MARK: - Corner Brackets
struct CornerBrackets: View {
    let width: CGFloat
    let height: CGFloat
    let bracketLength: CGFloat = 30
    let bracketWidth: CGFloat = 3

    var body: some View {
        ZStack {
            // Top-left
            Path { path in
                path.move(to: CGPoint(x: -width/2, y: -height/2 + bracketLength))
                path.addLine(to: CGPoint(x: -width/2, y: -height/2))
                path.addLine(to: CGPoint(x: -width/2 + bracketLength, y: -height/2))
            }
            .stroke(Color.green, lineWidth: bracketWidth)

            // Top-right
            Path { path in
                path.move(to: CGPoint(x: width/2 - bracketLength, y: -height/2))
                path.addLine(to: CGPoint(x: width/2, y: -height/2))
                path.addLine(to: CGPoint(x: width/2, y: -height/2 + bracketLength))
            }
            .stroke(Color.green, lineWidth: bracketWidth)

            // Bottom-left
            Path { path in
                path.move(to: CGPoint(x: -width/2, y: height/2 - bracketLength))
                path.addLine(to: CGPoint(x: -width/2, y: height/2))
                path.addLine(to: CGPoint(x: -width/2 + bracketLength, y: height/2))
            }
            .stroke(Color.green, lineWidth: bracketWidth)

            // Bottom-right
            Path { path in
                path.move(to: CGPoint(x: width/2 - bracketLength, y: height/2))
                path.addLine(to: CGPoint(x: width/2, y: height/2))
                path.addLine(to: CGPoint(x: width/2, y: height/2 - bracketLength))
            }
            .stroke(Color.green, lineWidth: bracketWidth)
        }
    }
}

// MARK: - Camera Preview View
struct CameraPreviewView: UIViewRepresentable {
    let session: AVCaptureSession

    func makeUIView(context: Context) -> UIView {
        let view = UIView(frame: .zero)
        view.backgroundColor = .black

        let previewLayer = AVCaptureVideoPreviewLayer(session: session)
        previewLayer.videoGravity = .resizeAspectFill
        view.layer.addSublayer(previewLayer)

        context.coordinator.previewLayer = previewLayer

        return view
    }

    func updateUIView(_ uiView: UIView, context: Context) {
        DispatchQueue.main.async {
            context.coordinator.previewLayer?.frame = uiView.bounds
        }
    }

    func makeCoordinator() -> Coordinator {
        Coordinator()
    }

    class Coordinator {
        var previewLayer: AVCaptureVideoPreviewLayer?
    }
}

// MARK: - Camera Manager
class CameraManager: NSObject, ObservableObject {
    enum DistancePreset {
        case close  // 2 meters
        case normal // 3 meters
        case far    // 4 meters

        var zoomFactor: CGFloat {
            switch self {
            case .close: return 2.0
            case .normal: return 2.5
            case .far: return 3.5
            }
        }
    }

    let session = AVCaptureSession()
    private var videoDeviceInput: AVCaptureDeviceInput?
    private let photoOutput = AVCapturePhotoOutput()
    private var photoCompletion: ((UIImage?) -> Void)?

    @Published var zoomFactor: CGFloat = 2.5 // Default to "Normal" (3m)
    @Published var currentPreset: DistancePreset = .normal
    @Published var maxZoomFactor: CGFloat = 5.0

    override init() {
        super.init()
        setupCamera()
    }

    private func setupCamera() {
        session.beginConfiguration()
        session.sessionPreset = .photo

        guard let videoDevice = AVCaptureDevice.default(.builtInWideAngleCamera, for: .video, position: .back) else {
            session.commitConfiguration()
            return
        }

        do {
            let videoDeviceInput = try AVCaptureDeviceInput(device: videoDevice)

            if session.canAddInput(videoDeviceInput) {
                session.addInput(videoDeviceInput)
                self.videoDeviceInput = videoDeviceInput
            }

            if session.canAddOutput(photoOutput) {
                session.addOutput(photoOutput)
                photoOutput.isHighResolutionCaptureEnabled = true
            }

            // Set max zoom factor (limit to reasonable amount)
            maxZoomFactor = min(videoDevice.activeFormat.videoMaxZoomFactor, 5.0)

            session.commitConfiguration()

            // Apply default zoom
            applyZoom()
        } catch {
            print("Error setting up camera: \(error)")
            session.commitConfiguration()
        }
    }

    func startSession() {
        DispatchQueue.global(qos: .userInitiated).async { [weak self] in
            self?.session.startRunning()
        }
    }

    func stopSession() {
        DispatchQueue.global(qos: .userInitiated).async { [weak self] in
            self?.session.stopRunning()
        }
    }

    func setDistancePreset(_ preset: DistancePreset) {
        currentPreset = preset
        zoomFactor = preset.zoomFactor
        applyZoom()
    }

    func applyZoom() {
        guard let device = videoDeviceInput?.device else { return }

        do {
            try device.lockForConfiguration()

            // Clamp zoom factor to valid range
            let clampedZoom = min(max(zoomFactor, 1.0), maxZoomFactor)
            device.videoZoomFactor = clampedZoom

            // Lock focus at center for better text recognition
            if device.isFocusModeSupported(.continuousAutoFocus) {
                device.focusMode = .continuousAutoFocus
            }

            // Lock exposure at center
            if device.isExposureModeSupported(.continuousAutoExposure) {
                device.exposureMode = .continuousAutoExposure
            }

            device.unlockForConfiguration()
        } catch {
            print("Error applying zoom: \(error)")
        }
    }

    func capturePhoto(completion: @escaping (UIImage?) -> Void) {
        photoCompletion = completion

        let settings = AVCapturePhotoSettings()
        settings.isHighResolutionPhotoEnabled = true

        if let previewPixelType = settings.availablePreviewPhotoPixelFormatTypes.first {
            settings.previewPhotoFormat = [kCVPixelBufferPixelFormatTypeKey as String: previewPixelType]
        }

        photoOutput.capturePhoto(with: settings, delegate: self)
    }
}

// MARK: - AVCapturePhotoCaptureDelegate
extension CameraManager: AVCapturePhotoCaptureDelegate {
    func photoOutput(
        _ output: AVCapturePhotoOutput,
        didFinishProcessingPhoto photo: AVCapturePhoto,
        error: Error?
    ) {
        if let error = error {
            print("Error capturing photo: \(error)")
            photoCompletion?(nil)
            return
        }

        guard let imageData = photo.fileDataRepresentation(),
              let image = UIImage(data: imageData) else {
            photoCompletion?(nil)
            return
        }

        photoCompletion?(image)
    }
}
