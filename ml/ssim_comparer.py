"""
WebGuard AI — Structural Similarity (SSIM) Image Comparer
ml/ssim_comparer.py

Computes visual similarity between two website screenshots using:
- OpenCV (cv2) for image preprocessing and resizing
- Scikit-Image (skimage.metrics.structural_similarity) for SSIM score & difference map
"""

import sys
import os

try:
    import cv2
    from skimage.metrics import structural_similarity as ssim
except ImportError:
    print("[-] Missing dependencies. Install with: pip install opencv-python scikit-image numpy")
    sys.exit(1)


def compare_screenshots_ssim(
    img_path1="screenshot1.png",
    img_path2="screenshot2.png",
    diff_output="ssim_diff.png",
    official_domain="google.com",
    current_domain="google-login-secure.xyz"
):
    if not os.path.exists(img_path1):
        print(f"[-] Image not found: {img_path1}")
        return None
    if not os.path.exists(img_path2):
        print(f"[-] Image not found: {img_path2}")
        return None

    # 1. Load images using OpenCV
    img1 = cv2.imread(img_path1)
    img2 = cv2.imread(img_path2)

    if img1 is None or img2 is None:
        print("[-] Could not decode one of the image files.")
        return None

    # 2. Resize both images to standard comparison dimensions (800x600)
    img1 = cv2.resize(img1, (800, 600))
    img2 = cv2.resize(img2, (800, 600))

    # 3. Convert to Grayscale
    gray1 = cv2.cvtColor(img1, cv2.COLOR_BGR2GRAY)
    gray2 = cv2.cvtColor(img2, cv2.COLOR_BGR2GRAY)

    # 4. Compute Structural Similarity Index (SSIM) and difference map
    score, diff = ssim(gray1, gray2, full=True)
    similarity_pct = score * 100.0

    # diff image is in float range [-1, 1], normalize to [0, 255] for visualization
    diff_visual = (diff * 255).astype("uint8")
    cv2.imwrite(diff_output, diff_visual)

    print("\n" + "=" * 50)
    print("  WebGuard AI — SSIM Visual Similarity Audit")
    print("=" * 50)
    print(f"Current Domain:           {current_domain}")
    print(f"Official Domain:          {official_domain}")
    print(f"Visual Similarity:        {similarity_pct:.2f}% (SSIM: {score:.4f})")
    print(f"Difference Map saved to:  {diff_output}")

    # Core Phishing Clone Detection Rule:
    # High visual similarity (>80%) on an unauthorized domain indicates a clone
    is_clone = False
    if score > 0.80 and official_domain != current_domain:
        print("⚠ Possible phishing clone detected")
        is_clone = True
    elif official_domain == current_domain:
        print("[+] Verified Official Domain. Authentic website.")
    else:
        print("[+] Low visual resemblance. No visual clone detected.")

    print("=" * 50 + "\n")
    return {
        "score": score,
        "similarity_pct": similarity_pct,
        "is_clone": is_clone,
        "diff_output": diff_output
    }


if __name__ == "__main__":
    file1 = sys.argv[1] if len(sys.argv) > 1 else "screenshot1.png"
    file2 = sys.argv[2] if len(sys.argv) > 2 else "screenshot2.png"
    cur_dom = sys.argv[3] if len(sys.argv) > 3 else "google-login-secure.xyz"
    off_dom = sys.argv[4] if len(sys.argv) > 4 else "google.com"

    compare_screenshots_ssim(file1, file2, official_domain=off_dom, current_domain=cur_dom)
