"""
WebGuard AI — Python Website Visual & Content Comparer
ml/website_comparer.py

Compares two websites (e.g. Suspicious site vs. Authentic Original):
- Validates URLs
- Captures full-page screenshots via Selenium / Headless Browser
- Computes visual pixel differences using Pillow (PIL) ImageChops
- Compares HTML structure and extracts textual diffs via difflib.HtmlDiff
- Analyzes navigation load times via window.performance
- Extracts and checks broken/redirected hyperlinks
"""

import os
import re
import sys
import time
from urllib.parse import urljoin, urlparse
import requests
from bs4 import BeautifulSoup
from difflib import HtmlDiff
from PIL import Image, ImageChops

try:
    from selenium import webdriver
    from selenium.webdriver.chrome.options import Options as ChromeOptions
    from selenium.webdriver.firefox.options import Options as FirefoxOptions
    from webdriver_manager.chrome import ChromeDriverManager
    from webdriver_manager.firefox import GeckoDriverManager
except ImportError:
    webdriver = None


class WebsiteComparer:
    def __init__(self, browser="chrome"):
        self.browser_type = browser.lower()

    def validate_url(self, url):
        """Validate standard HTTP / HTTPS URL syntax"""
        if not url:
            return False
        pattern = re.compile(
            r"^(https?://)?"
            r"((([a-zA-Z0-9_-]+)\.)+[a-zA-Z]{2,})"
            r"(/([a-zA-Z0-9_./\-#?&=%])*)*$",
            re.IGNORECASE
        )
        return bool(re.match(pattern, url.strip()))

    def get_driver(self):
        """Initialize headless browser driver (Chrome or Firefox)"""
        if self.browser_type == "firefox":
            options = FirefoxOptions()
            options.add_argument("--headless")
            return webdriver.Firefox(
                executable_path=GeckoDriverManager().install(),
                options=options
            )
        else:
            options = ChromeOptions()
            options.add_argument("--headless=new")
            options.add_argument("--no-sandbox")
            options.add_argument("--disable-dev-shm-usage")
            options.add_argument("--window-size=1280,800")
            return webdriver.Chrome(
                executable_path=ChromeDriverManager().install(),
                options=options
            )

    def get_page_urls(self, url):
        """Extract all valid hyperlinks from the given URL"""
        try:
            response = requests.get(url, timeout=10, headers={
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) WebGuard-Comparer/1.0"
            })
            if response.status_code != 200:
                print(f"[-] Website returned HTTP {response.status_code}: {url}")
                return []

            soup = BeautifulSoup(response.text, "html.parser")
            page_urls = []
            for link in soup.find_all("a"):
                href = link.get("href")
                if href and not href.startswith(("#", "javascript:", "mailto:")):
                    full_url = urljoin(url, href)
                    if full_url not in page_urls:
                        page_urls.append(full_url)
            return page_urls
        except Exception as e:
            print(f"[-] Failed to extract URLs from {url}: {e}")
            return []

    def check_broken_links(self, driver):
        """Check for 404/broken links on the active page"""
        links = driver.find_elements("tag name", "a")
        broken_links = []
        for link in links[:30]:  # sample first 30 links
            href = link.get_attribute("href")
            if href and href.startswith("http"):
                try:
                    res = requests.head(href, timeout=5, allow_redirects=True)
                    if res.status_code >= 400:
                        broken_links.append((href, res.status_code))
                except Exception:
                    broken_links.append((href, "TIMEOUT_OR_FAILED"))
        return broken_links

    def analyze_page_load_times(self, driver, url):
        """Measure navigation and DOM complete load times via Performance Timing API"""
        driver.get(url)
        time.sleep(1)
        nav_start = driver.execute_script("return window.performance.timing.navigationStart")
        load_end = driver.execute_script("return window.performance.timing.loadEventEnd")
        if nav_start and load_end and load_end > nav_start:
            page_load_time = (load_end - nav_start) / 1000.0
            print(f"[+] Page load time for {url}: {page_load_time:.2f} seconds")
            return page_load_time
        return None

    def compute_visual_difference(self, img_path1, img_path2, output_diff_path="visual_diff.png"):
        """Compare two screenshots using Pillow ImageChops difference"""
        img1 = Image.open(img_path1).convert("RGB")
        img2 = Image.open(img_path2).convert("RGB")

        # Resize to match dimensions if different
        if img1.size != img2.size:
            target_size = (max(img1.size[0], img2.size[0]), max(img1.size[1], img2.size[1]))
            img1 = img1.resize(target_size, Image.Resampling.BILINEAR)
            img2 = img2.resize(target_size, Image.Resampling.BILINEAR)

        diff_image = ImageChops.difference(img1, img2)
        bbox = diff_image.getbbox()

        if bbox:
            diff_image.save(output_diff_path)
            print(f"[!] Visual differences detected. Saved difference map to: {output_diff_path}")
            return True, output_diff_path
        else:
            print("[+] No visual differences detected. Images are identical.")
            return False, None

    def compute_ssim_similarity(self, img_path1, img_path2, output_diff_path="ssim_diff.png"):
        """Compute Structural Similarity (SSIM) using OpenCV and skimage"""
        try:
            import cv2
            from skimage.metrics import structural_similarity as ssim

            img1 = cv2.imread(img_path1)
            img2 = cv2.imread(img_path2)

            if img1 is None or img2 is None:
                return None, None

            img1 = cv2.resize(img1, (800, 600))
            img2 = cv2.resize(img2, (800, 600))

            gray1 = cv2.cvtColor(img1, cv2.COLOR_BGR2GRAY)
            gray2 = cv2.cvtColor(img2, cv2.COLOR_BGR2GRAY)

            score, diff = ssim(gray1, gray2, full=True)
            diff_visual = (diff * 255).astype("uint8")
            cv2.imwrite(output_diff_path, diff_visual)

            similarity_pct = score * 100.0
            print(f"[+] SSIM Visual Similarity: {similarity_pct:.2f}%")
            return similarity_pct, output_diff_path
        except ImportError:
            print("[-] opencv-python or scikit-image not installed. Falling back to PIL comparison.")
            return None, None

    def compare_websites(self, url1, url2, output_dir="comparison_output"):
        """Full end-to-end comparison of two websites"""
        if not self.validate_url(url1) or not self.validate_url(url2):
            print("[-] Error: Invalid URL provided.")
            return False

        if url1.strip().lower() == url2.strip().lower():
            print("[-] Error: Both URLs are identical. Please provide two distinct sites to compare.")
            return False

        os.makedirs(output_dir, exist_ok=True)
        print(f"\n[+] Starting comparison:\n    Website 1 (Suspect):  {url1}\n    Website 2 (Original): {url2}\n")

        driver1 = self.get_driver()
        driver2 = self.get_driver()

        try:
            # 1. Performance & Page Load Times
            time1 = self.analyze_page_load_times(driver1, url1)
            time2 = self.analyze_page_load_times(driver2, url2)

            # 2. Screenshots & Visual Difference
            shot1 = os.path.join(output_dir, "screenshot1.png")
            shot2 = os.path.join(output_dir, "screenshot2.png")
            driver1.save_screenshot(shot1)
            driver2.save_screenshot(shot2)
            print(f"[+] Screenshots captured:\n    1: {shot1}\n    2: {shot2}")

            # 3. SSIM Structural Similarity & Difference Map
            ssim_diff_path = os.path.join(output_dir, "ssim_diff.png")
            ssim_score, _ = self.compute_ssim_similarity(shot1, shot2, ssim_diff_path)

            diff_path = os.path.join(output_dir, "visual_diff.png")
            has_diff, _ = self.compute_visual_difference(shot1, shot2, diff_path)

            # 3. HTML Content Diff
            html1 = driver1.page_source
            html2 = driver2.page_source
            differ = HtmlDiff()
            html_diff_content = differ.make_file(
                html1.splitlines(),
                html2.splitlines(),
                fromdesc="Website 1 (Suspect)",
                todesc="Website 2 (Original)"
            )
            content_diff_file = os.path.join(output_dir, "content_diff.html")
            with open(content_diff_file, "w", encoding="utf-8") as f:
                f.write(html_diff_content)
            print(f"[+] Content HTML difference report saved to: {content_diff_file}")

            # 4. Link extraction & External Pointers
            links1 = self.get_page_urls(url1)
            links2 = self.get_page_urls(url2)
            with open(os.path.join(output_dir, "links_website1.txt"), "w", encoding="utf-8") as f:
                f.write("\n".join(links1))
            with open(os.path.join(output_dir, "links_website2.txt"), "w", encoding="utf-8") as f:
                f.write("\n".join(links2))
            print(f"[+] Hyperlinks saved (W1: {len(links1)} links, W2: {len(links2)} links)")

            # Check if Website 1 links to Website 2's domain (phishing brand pointer indicator)
            domain2 = urlparse(url2).netloc.lower()
            pointing_to_w2 = [l for l in links1 if domain2 in l.lower()]
            if pointing_to_w2:
                print(f"[!] SUSPICIOUS: Website 1 has {len(pointing_to_w2)} links pointing directly to {domain2}!")

            print(f"\n[+] Comparison completed successfully. Results saved in directory: {output_dir}/")
            return True

        finally:
            driver1.quit()
            driver2.quit()


if __name__ == "__main__":
    if len(sys.argv) >= 3:
        u1 = sys.argv[1]
        u2 = sys.argv[2]
    else:
        print("WebGuard AI — Website Comparer CLI")
        u1 = input("Enter Website 1 URL (e.g. Suspect site): ").strip()
        u2 = input("Enter Website 2 URL (e.g. Original authentic site): ").strip()

    comparer = WebsiteComparer(browser="chrome")
    comparer.compare_websites(u1, u2)
