'use client'

import React, { useState, useRef } from "react";
import { useRouter } from 'next/navigation'

const DropDown = () => {
  const router = useRouter()
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const [isHamburgerMenuOpen, setIsHamburgerMenuOpen] = useState<boolean>(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const headerMenuItemObject = [
    { name: '企業',
      href: '/dummyMenu1/',
      items: [
      { name: 'ドロップダウンリンク1', href: '/dummy/' },
      { name: 'ドロップダウンリンク2', href: '/dummy/' },
      { name: 'ドロップダウンリンク3', href: '/dummy/' },
    ]},
    { name: 'サービス',
      href: '/dummyMenu2/',
      items: [
      { name: 'ドロップダウンリンク4', href: '/dummy/' },
      { name: 'ドロップダウンリンク5', href: '/dummy/' },
      { name: 'ドロップダウンリンク6', href: '/dummy/' },
    ]},
    { name: 'お知らせ',
      href: '/dummyMenu3/',
      items: [
      { name: 'ドロップダウンリンク7', href: '/dummy/' },
      { name: 'ドロップダウンリンク8', href: '/dummy/' },
      { name: 'ドロップダウンリンク9', href: '/dummy/' },
    ]},
    { name: '採用情報',
      href: '/dummyMenu4/',
      items: [
      { name: 'ドロップダウンリンク10', href: '/dummy/' },
      { name: 'ドロップダウンリンク11', href: '/dummy/' },
      { name: 'ドロップダウンリンク12', href: '/dummy/' },
    ]},
    { name: 'お問い合わせ',
      href: '/dummyMenu5/',
      items: [
      { name: 'ドロップダウンリンク13', href: '/dummy/' },
      { name: 'ドロップダウンリンク14', href: '/dummy/' },
      { name: 'ドロップダウンリンク15', href: '/dummy/' },
    ]}
  ];

  // ドロップダウンメニューを開く
  const handleMouseEnter = (menu: string) => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current); // 非表示のタイマーをキャンセル
    }
    setActiveMenu(menu);
  };

  // ドロップダウンメニューを閉じる
  const handleMouseLeave = () => {
    timeoutRef.current = setTimeout(() => {
      setActiveMenu(null);
    }, 1000);
  };

  const handleHamburgerMenuToggle = () => {
    setIsHamburgerMenuOpen((prev) => !prev);
  };

  const closeHamburgerMenu = () => {
    setIsHamburgerMenuOpen(false);
  };

  return (
    <div>
      <header className="relative h-14 lg:bg-gray-800 lg:flex lg:items-center lg:gap-8 lg:p-4 text-white">
        <div className="block lg:hidden w-14 h-14 bg-gray-800 absolute top-0 right-0 flex items-center justify-center">
          <button className="w-10 h-10" aria-label={isHamburgerMenuOpen ? "メニューを閉じる" : "メニューを開く"} aria-expanded={isHamburgerMenuOpen} onClick={handleHamburgerMenuToggle}>
            {isHamburgerMenuOpen ? <img className="w-full" src="/close.svg" alt="" /> : <img className="w-full" src="/hamburger.svg" alt="" />}
          </button>
        </div>
        <div className="lg:block hidden">
        <a href="/"><img className="w-14" src="/dummy-icon.png" alt="" /></a>
        </div>
        <nav className={`pt-14 bg-gray-800 lg:block lg:pt-0 ${isHamburgerMenuOpen ? 'block' : 'hidden'}`}>
          <ul className="lg:flex">
            {headerMenuItemObject.map((item, index) => (
              <li className="block h-8" key={index}>
                <div className="h-full"
                  onMouseEnter={() => {
                    handleMouseEnter(`dropDown-${index + 1}`);
                  }}
                  onMouseLeave={() => {
                    handleMouseLeave()
                  }}>
                  <a href={item.href} className="block content-center px-4 h-full bg-gray-700 hover:bg-gray-600"
                  aria-haspopup="true"
                  aria-expanded={activeMenu === `dropDown-${index + 1}`}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault()
                      if (activeMenu === `dropDown-${index + 1}`) {
                        setActiveMenu(null);
                        return;
                      }
                      handleMouseEnter(`dropDown-${index + 1}`);
                    }
                  }}
                  >{item.name}</a>
                  <div className={`lg:absolute relative left-0 top-14 w-screen bg-white text-black shadow-lg overflow-hidden transition-all duration-300 ease-out origin-top ${
                    activeMenu === `dropDown-${index + 1}` ? 'scale-y-100 opacity-100' : 'scale-y-0 opacity-0'
                  }`}
                  inert={activeMenu !== `dropDown-${index + 1}`}
                  role="menu">
                    <div>
                      <ul>
                        {item.items.map((subItem, subIndex) => (
                          <li key={subIndex}><a className="block px-4 py-2 hover:bg-gray-200" href={subItem.href}>{subItem.name}</a></li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              </li>
            ))
            }
          </ul>
        </nav>
      </header>
    </div>
  );
}

export default DropDown;