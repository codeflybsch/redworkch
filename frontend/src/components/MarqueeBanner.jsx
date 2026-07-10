import React, { useEffect, useMemo, useState } from "react";
import { Megaphone } from "lucide-react";
import { API } from "../api";

const TARGETS = {
  home: {
    enabledKey: "homeMarqueeEnabled",
    textKey: "homeMarqueeText",
    speedKey: "homeMarqueeSpeed",
    itemsKey: "homeMarqueeItems",
    className: "marquee-banner-home bg-[#E63946] text-white",
  },
  account: {
    enabledKey: "accountMarqueeEnabled",
    textKey: "accountMarqueeText",
    speedKey: "accountMarqueeSpeed",
    itemsKey: "accountMarqueeItems",
    className: "marquee-banner-account bg-[#0f172a] text-white",
  },
};

export default function MarqueeBanner({ target = "home" }) {
  const config = TARGETS[target] || TARGETS.home;
  const [settings, setSettings] = useState(null);

  useEffect(() => {
    let active = true;
    fetch(`${API}/site-settings`)
      .then((r) => r.json())
      .then((data) => {
        if (active) setSettings(data || {});
      })
      .catch(() => {
        if (active) setSettings({});
      });
    return () => {
      active = false;
    };
  }, []);

  const enabled = Boolean(settings?.[config.enabledKey]);
  const speed = Math.max(10, Number(settings?.[config.speedKey] || 28));
  const items = useMemo(() => {
    const configured = Array.isArray(settings?.[config.itemsKey])
      ? settings[config.itemsKey]
          .map((item) => ({
            text: String(item?.text || "").trim(),
            image: String(item?.image || "").trim(),
            href: String(item?.href || "").trim(),
          }))
          .filter((item) => item.text || item.image)
      : [];
    const legacyText = String(settings?.[config.textKey] || "").trim();
    return configured.length ? configured : legacyText ? [{ text: legacyText, image: "", href: "" }] : [];
  }, [settings, config.itemsKey, config.textKey]);

  const repeated = useMemo(() => {
    if (!items.length) return [];
    const repeatCount = Math.max(3, Math.ceil(10 / items.length));
    return Array.from({ length: repeatCount }, () => items).flat();
  }, [items]);

  if (!enabled || !items.length) return null;

  const srText = items.map((item) => item.text).filter(Boolean).join(" ");
  const renderItem = (item, key) => {
    const content = (
      <>
        {item.image && <img className="marquee-item-image" src={item.image} alt="" loading="lazy" />}
        {item.text && <span>{item.text}</span>}
        <b>•</b>
      </>
    );
    if (item.href) {
      return (
        <a key={key} className="marquee-item" href={item.href}>
          {content}
        </a>
      );
    }
    return <span key={key} className="marquee-item">{content}</span>;
  };

  return (
    <div className={`marquee-banner ${config.className}`} style={{ "--marquee-duration": `${speed}s` }} role="region" aria-label="Aktuelle Mitteilung">
      <div className="marquee-label">
        <Megaphone size={16} />
        <span>Info</span>
      </div>
      <div className="marquee-track-wrap" aria-hidden="true">
        <div className="marquee-track">
          {[0, 1].map((group) => (
            <div className="marquee-group" key={group}>
              {repeated.map((item, index) => (
                renderItem(item, `${group}-${index}`)
              ))}
            </div>
          ))}
        </div>
      </div>
      <p className="sr-only">{srText}</p>
    </div>
  );
}
