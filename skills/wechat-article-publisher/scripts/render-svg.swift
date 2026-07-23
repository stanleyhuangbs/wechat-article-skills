import AppKit
import CoreText

guard CommandLine.arguments.count >= 4 else {
    fputs("usage: render-svg.swift output.png brand line1 [line2 ...]\n", stderr)
    exit(2)
}

let outputURL = URL(fileURLWithPath: CommandLine.arguments[1])
let brand = CommandLine.arguments[2]
let lines = Array(CommandLine.arguments.dropFirst(3))

guard let bitmap = NSBitmapImageRep(
    bitmapDataPlanes: nil,
    pixelsWide: 900,
    pixelsHigh: 383,
    bitsPerSample: 8,
    samplesPerPixel: 4,
    hasAlpha: true,
    isPlanar: false,
    colorSpaceName: .deviceRGB,
    bytesPerRow: 0,
    bitsPerPixel: 0
) else {
    fputs("cannot create bitmap\n", stderr)
    exit(1)
}

NSGraphicsContext.saveGraphicsState()
NSGraphicsContext.current = NSGraphicsContext(bitmapImageRep: bitmap)
NSColor(calibratedRed: 247.0 / 255.0, green: 246.0 / 255.0, blue: 242.0 / 255.0, alpha: 1).setFill()
NSRect(x: 0, y: 0, width: 900, height: 383).fill()

let context = NSGraphicsContext.current!.cgContext
context.setFillColor(CGColor(red: 157.0 / 255.0, green: 51.0 / 255.0, blue: 44.0 / 255.0, alpha: 1))
context.fill(CGRect(x: 42, y: 48, width: 6, height: 287))

let mainFont = CTFontCreateWithName("STHeitiSC-Medium" as CFString, 38, nil)
let mainColor = CGColor(red: 23.0 / 255.0, green: 23.0 / 255.0, blue: 23.0 / 255.0, alpha: 1)
let startTop = 100.0 - Double(max(0, lines.count - 3)) * 18.0

for (index, text) in lines.enumerated() {
    let attributes: [NSAttributedString.Key: Any] = [
        NSAttributedString.Key(kCTFontAttributeName as String): mainFont,
        NSAttributedString.Key(kCTForegroundColorAttributeName as String): mainColor,
        NSAttributedString.Key.kern: 0
    ]
    let attributed = NSAttributedString(string: text, attributes: attributes)
    let line = CTLineCreateWithAttributedString(attributed)
    let baselineFromTop = startTop + Double(index) * 64.0
    context.textPosition = CGPoint(x: 72, y: 383.0 - baselineFromTop)
    CTLineDraw(line, context)
}

let footerFont = CTFontCreateWithName("STHeitiSC-Light" as CFString, 15, nil)
let footerColor = CGColor(red: 119.0 / 255.0, green: 113.0 / 255.0, blue: 107.0 / 255.0, alpha: 1)
let footer = NSAttributedString(string: brand, attributes: [
    NSAttributedString.Key(kCTFontAttributeName as String): footerFont,
    NSAttributedString.Key(kCTForegroundColorAttributeName as String): footerColor,
    NSAttributedString.Key.kern: 2
])
context.textPosition = CGPoint(x: 72, y: 53)
CTLineDraw(CTLineCreateWithAttributedString(footer), context)
NSGraphicsContext.restoreGraphicsState()

guard let data = bitmap.representation(using: .png, properties: [:]) else {
    fputs("cannot encode PNG\n", stderr)
    exit(1)
}

try data.write(to: outputURL)
