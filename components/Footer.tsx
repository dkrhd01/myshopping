import Link from "next/link";
import { Instagram, Facebook, Twitter, Mail } from "lucide-react";

const Footer = () => {
  return (
    <footer className="border-t bg-white">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* 브랜드 정보 */}
          <div className="space-y-4">
            <Link href="/" className="group">
              <div className="relative">
                <span
                  className="text-2xl font-normal tracking-[0.15em] text-foreground group-hover:text-primary transition-colors"
                  style={{ fontFamily: "var(--font-playfair), serif" }}
                >
                  FAPI
                </span>
                <div className="absolute -bottom-1 left-0 w-full h-px bg-gradient-to-r from-transparent via-foreground/30 to-transparent group-hover:via-primary/50 transition-colors" />
              </div>
            </Link>
            <p className="text-sm text-gray-600 leading-relaxed">
              프리미엄 패션 컬렉션으로 여러분의 스타일을 완성하세요.
            </p>
          </div>

          {/* 쇼핑 */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 mb-4 tracking-wide">
              쇼핑
            </h3>
            <ul className="space-y-3">
              <li>
                <Link
                  href="/products"
                  className="text-sm text-gray-600 hover:text-gray-900 transition-colors"
                >
                  전체 상품
                </Link>
              </li>
              <li>
                <Link
                  href="/products?category=상의"
                  className="text-sm text-gray-600 hover:text-gray-900 transition-colors"
                >
                  상의
                </Link>
              </li>
              <li>
                <Link
                  href="/products?category=하의"
                  className="text-sm text-gray-600 hover:text-gray-900 transition-colors"
                >
                  하의
                </Link>
              </li>
              <li>
                <Link
                  href="/products?category=신발"
                  className="text-sm text-gray-600 hover:text-gray-900 transition-colors"
                >
                  신발
                </Link>
              </li>
              <li>
                <Link
                  href="/products?category=액세서리"
                  className="text-sm text-gray-600 hover:text-gray-900 transition-colors"
                >
                  액세서리
                </Link>
              </li>
            </ul>
          </div>

          {/* 고객지원 */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 mb-4 tracking-wide">
              고객지원
            </h3>
            <ul className="space-y-3">
              <li>
                <Link
                  href="/about"
                  className="text-sm text-gray-600 hover:text-gray-900 transition-colors"
                >
                  회사 소개
                </Link>
              </li>
              <li>
                <Link
                  href="/contact"
                  className="text-sm text-gray-600 hover:text-gray-900 transition-colors"
                >
                  문의하기
                </Link>
              </li>
              <li>
                <Link
                  href="/faq"
                  className="text-sm text-gray-600 hover:text-gray-900 transition-colors"
                >
                  자주 묻는 질문
                </Link>
              </li>
              <li>
                <Link
                  href="/shipping"
                  className="text-sm text-gray-600 hover:text-gray-900 transition-colors"
                >
                  배송 정보
                </Link>
              </li>
              <li>
                <Link
                  href="/returns"
                  className="text-sm text-gray-600 hover:text-gray-900 transition-colors"
                >
                  반품/교환
                </Link>
              </li>
            </ul>
          </div>

          {/* 뉴스레터 */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 mb-4 tracking-wide">
              뉴스레터
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              최신 컬렉션과 특별 혜택을 가장 먼저 받아보세요.
            </p>
            <div className="flex gap-2">
              <input
                type="email"
                placeholder="이메일 주소"
                className="flex-1 px-4 py-2 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              />
              <button className="px-4 py-2 text-sm bg-gray-900 text-white rounded hover:bg-gray-800 transition-colors">
                구독
              </button>
            </div>
            <div className="flex gap-4 mt-6">
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-600 hover:text-gray-900 transition-colors"
                aria-label="Instagram"
              >
                <Instagram className="h-5 w-5" />
              </a>
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-600 hover:text-gray-900 transition-colors"
                aria-label="Facebook"
              >
                <Facebook className="h-5 w-5" />
              </a>
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-600 hover:text-gray-900 transition-colors"
                aria-label="Twitter"
              >
                <Twitter className="h-5 w-5" />
              </a>
              <a
                href="mailto:contact@fapi.com"
                className="text-gray-600 hover:text-gray-900 transition-colors"
                aria-label="Email"
              >
                <Mail className="h-5 w-5" />
              </a>
            </div>
          </div>
        </div>

        {/* 하단 구분선 및 저작권 */}
        <div className="pt-8 border-t">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-gray-600">
              © {new Date().getFullYear()} FAPI. All rights reserved.
            </p>
            <div className="flex gap-6">
              <Link
                href="/terms"
                className="text-sm text-gray-600 hover:text-gray-900 transition-colors"
              >
                이용약관
              </Link>
              <Link
                href="/privacy"
                className="text-sm text-gray-600 hover:text-gray-900 transition-colors"
              >
                개인정보처리방침
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;








