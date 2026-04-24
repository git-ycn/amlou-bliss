import React, { useState, useEffect, useContext, createContext, useCallback, memo } from 'react';
import { ArrowRight, Heart, X, Instagram, Facebook, MessageCircle, Mail, Globe, Coins } from 'lucide-react';
import { motion, AnimatePresence, useMotionValue, useTransform, useScroll, useSpring, useMotionValueEvent } from 'motion/react';
import { DICT } from './translations';
import { PRODUCTS, RECIPES, CARD_DATA } from './data';

const LangContext = createContext<any>(null);
const CurrencyContext = createContext<any>(null);

const TikTokIcon = ({ className = "" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-5.2 1.74 2.89 2.89 0 012.31-4.64 2.93 2.93 0 01.88.13V9.4a6.84 6.84 0 00-1-.05A6.33 6.33 0 005 20.1a6.34 6.34 0 0010.86-4.43v-7a8.16 8.16 0 004.77 1.52v-3.4a4.85 4.85 0 01-1.04-.1z" />
  </svg>
);

const CURRENCIES: Record<string, { symbol: string, rate: number }> = {
  USD: { symbol: '$', rate: 1 },
  EUR: { symbol: '€', rate: 0.93 },
  MAD: { symbol: 'DH', rate: 10.1 }
};

function RevealText({ text, className = "", delay = 0, once = false, isLogo = false, fast = false }: any) {
  const words = text.split(" ");
  if (fast) {
    return (
      <motion.div
        key={text}
        initial="hidden"
        whileInView="visible"
        viewport={{ once, amount: 0.2 }}
        variants={{
          hidden: { opacity: 0, y: 15 },
          visible: { 
            opacity: 1, 
            y: 0, 
            transition: { 
              delay, 
              duration: 0.4, 
              ease: "easeOut" 
            } 
          }
        }}
        className={`${className} will-change-transform`}
      >
        {text}
      </motion.div>
    );
  }
  return (
    <motion.div 
      key={text}
      initial="hidden" 
      whileInView="visible" 
      viewport={{ once, amount: 0.2 }}
      className={`flex flex-wrap justify-center ${className} will-change-transform`}
    >
      {words.map((word: string, i: number) => (
        <motion.span
          key={i}
          variants={{
            hidden: { opacity: 0, y: 30 },
            visible: { 
              opacity: 1, 
              y: 0, 
              transition: { 
                delay: delay + (i * 0.08),
                duration: 0.8,
                ease: [0.33, 1, 0.68, 1]
              } 
            }
          }}
          className={`${isLogo ? '' : 'mr-[0.25em]'}`}
        >
          {word}
        </motion.span>
      ))}
    </motion.div>
  );
}

function useTranslation() {
  const context = useContext(LangContext);
  if (!context) throw new Error("useTranslation must be used within a LangProvider");
  const { lang, setLang } = context;
  const t = (key: string) => DICT[lang]?.[key] || DICT['en'][key] || key;
  const isRTL = lang === 'ar';
  return { lang, setLang, t, isRTL };
}

function useCurrency() {
  const context = useContext(CurrencyContext);
  if (!context) return { currency: 'USD', setCurrency: () => {}, formatPrice: (v: number) => `$${v.toFixed(2)}`, currencies: ['USD'] };
  const { currency, setCurrency } = context;
  const formatPrice = (usdAmount: number) => {
    const cur = CURRENCIES[currency];
    const converted = usdAmount * cur.rate;
    if (currency === 'MAD') return `${converted.toFixed(2)} ${cur.symbol}`;
    return `${cur.symbol}${converted.toFixed(2)}`;
  };
  return { currency, setCurrency, formatPrice, currencies: Object.keys(CURRENCIES) };
}

// Extracted NavBar component for performance optimization.
function NavBar({ cartCount, onOpenCart, isMenuOpen, setIsMenuOpen }: any) {
  const { scrollY } = useScroll();
  const [isScrolled, setIsScrolled] = useState(false);
  const { lang, setLang, t, isRTL } = useTranslation();
  const { currency, setCurrency, currencies } = useCurrency();
  const [showLangs, setShowLangs] = useState(false);
  const [showCurrencies, setShowCurrencies] = useState(false);
  const langRef = React.useRef<HTMLDivElement>(null);
  const curRef = React.useRef<HTMLDivElement>(null);

  // Use useMotionValueEvent for high-performance scroll monitoring
  useMotionValueEvent(scrollY, "change", (latest) => {
    setIsScrolled(latest > 50);
  });

  // Close menus when clicking outside
  useEffect(() => {
    if (!showLangs && !showCurrencies) return;
    const handleGlobalClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest('.lang-toggle-btn')) setShowLangs(false);
      if (!target.closest('.cur-toggle-btn')) setShowCurrencies(false);
    };
    window.addEventListener('click', handleGlobalClick);
    return () => window.removeEventListener('click', handleGlobalClick);
  }, [showLangs, showCurrencies]);

  return (
    <nav 
      className={`fixed w-full top-0 z-[110] px-5 py-4 flex justify-between items-center transition-all duration-300 ease-out ${
        isScrolled || isMenuOpen ? 'bg-white/95 backdrop-blur-md text-black shadow-sm' : 'bg-transparent text-white'
      }`}
    >
      <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="font-medium text-[15px] tracking-wide hover:opacity-70 transition-opacity">
        {isMenuOpen ? t('close') : t('menu')}
      </button>

      <div className="flex items-center gap-4 md:gap-7">
        <div className="flex items-center gap-4 md:gap-6">
          <div className="relative" ref={langRef}>
            <button 
              onClick={(e) => { e.stopPropagation(); setShowLangs(!showLangs); setShowCurrencies(false); }} 
              className="lang-toggle-btn flex items-center gap-1.5 font-medium text-[13px] tracking-widest uppercase hover:opacity-70 transition-opacity pb-1"
            >
              <Globe className="w-3.5 h-3.5" /> {lang}
            </button>
            <AnimatePresence>
              {showLangs && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }} 
                  animate={{ opacity: 1, y: 0 }} 
                  exit={{ opacity: 0, y: 10 }} 
                  className="absolute top-full left-1/2 -translate-x-1/2 pt-2"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="bg-white text-black py-2 rounded-xl shadow-lg border border-gray-100 flex flex-col gap-0.5 w-24 overflow-hidden">
                    {['en', 'fr', 'ar'].map(l => (
                      <button 
                        key={l} 
                        onClick={() => { setLang(l); setShowLangs(false); }} 
                        className={`text-[10px] tracking-widest uppercase py-2.5 text-center hover:bg-gray-50 transition-colors ${lang === l ? 'font-bold text-[#ff8a00]' : 'text-gray-500'}`}
                      >
                        {l}
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="relative" ref={curRef}>
            <button 
              onClick={(e) => { e.stopPropagation(); setShowCurrencies(!showCurrencies); setShowLangs(false); }} 
              className="cur-toggle-btn flex items-center gap-1.5 font-medium text-[13px] tracking-widest uppercase hover:opacity-70 transition-opacity pb-1"
            >
              <Coins className="w-3.5 h-3.5" /> {currency}
            </button>
            <AnimatePresence>
              {showCurrencies && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }} 
                  animate={{ opacity: 1, y: 0 }} 
                  exit={{ opacity: 0, y: 10 }} 
                  className="absolute top-full left-1/2 -translate-x-1/2 pt-2"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="bg-white text-black py-2 rounded-xl shadow-lg border border-gray-100 flex flex-col gap-0.5 w-24 overflow-hidden">
                    {currencies.map(c => (
                      <button 
                        key={c} 
                        onClick={() => { setCurrency(c); setShowCurrencies(false); }} 
                        className={`text-[10px] tracking-widest uppercase py-2.5 text-center hover:bg-gray-50 transition-colors ${currency === c ? 'font-bold text-[#ff8a00]' : 'text-gray-500'}`}
                      >
                        {c}
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        <button onClick={onOpenCart} className="font-medium text-[15px] tracking-wide hover:opacity-70 transition-opacity flex items-start gap-0.5" style={{ alignItems: 'flex-start' }}>
          {t('cart')} <span className="text-[10px] leading-none mt-0.5 text-[#ff8a00] font-bold">{cartCount}</span>
        </button>
      </div>
    </nav>
  );
}

const PRODUCTS_INTERNAL = [
  { id: 'p1', title: 'Amlou Bliss - Classic', price: 24.00, img: '/amlou-250g.jpg', desc: 'The original recipe. Perfectly balanced roasted almonds, pure argan oil, and raw honey.' },
  { id: 'p2', title: 'Amlou Bliss - Toasted Almond', price: 26.00, img: '/amlou-500g.jpg', desc: 'Extra roasted almonds left slightly coarse for a satisfying crunch in every bite.' },
  { id: 'p3', title: 'Amlou Bliss - Argan Gold', price: 28.00, img: '/amlou-750g.jpg', desc: 'Infused with extra virgin argan oil for a rich, decadent twist on the traditional spread.' },
  { id: 'p4', title: 'Amlou Bliss - Floral Honey', price: 32.00, img: '/amlou-1kg.jpg', desc: 'Premium floral honey replaces traditional sweetness for a vibrant, luxurious flavor profile.' }
];

const RECIPES_INTERNAL = [
  { id: 'r1', title: 'Amlou & Almond Energy Balls', img: '/energy.jpg', desc: 'A quick, energizing bite blending pure Amlou with dates and oats.', ingredients: ['1/2 cup Amlou Bliss', '1 cup rolled oats', '1/2 cup Medjool dates', 'Pinch of sea salt'], instructions: ['Blend dates until sticky.', 'Mix in oats and Amlou.', 'Roll into bite-sized balls and refrigerate.'] },
  { id: 'r2', title: 'Souss Spiced Crepes', img: '/crepe.jpg', desc: 'Warm, thin Moroccan crepes drizzled generously with Classic Amlou.', ingredients: ['1 cup flour', '2 eggs', '1 cup milk', '1/4 cup Amlou Bliss for drizzling'], instructions: ['Whisk flour, eggs, and milk into a smooth batter.', 'Cook thin layers in a warm pan.', 'Fold and drizzle beautifully with Amlou.'] },
  { id: 'r3', title: 'Moroccan Parfait Bowl', img: 'https://images.unsplash.com/photo-1493770348161-369560ae357d?auto=format&fit=crop&q=80&w=800', desc: 'Layers of Greek yogurt, crunchy granola, and a ribbon of Amlou.', ingredients: ['1 cup Greek yogurt', '1/2 cup granola', '3 tbsp Amlou Bliss', 'Fresh mountain berries'], instructions: ['Layer yogurt at the base.', 'Add a generous dollop of Amlou.', 'Top with granola and fresh berries.'] },
  { id: 'r4', title: 'Amlou Drizzle Smoothie', img: '/smoothie.jpg', desc: 'A creamy, high-protein smoothie infused with Argan Gold.', ingredients: ['1 frozen banana', '1 tbsp Amlou Bliss', '1 cup almond milk', 'Cinnamon dusting'], instructions: ['Combine all ingredients in a blender.', 'Blend on high until perfectly smooth.', 'Serve chilled with a cinnamon dusting.'] },
  { id: 'r5', title: 'Stone-Ground Oatmeal', img: '/oatmeal.jpg', desc: 'Warm morning oats enriched with the nutty depth of true Amlou.', ingredients: ['1 cup steel-cut oats', '2 cups water', '2 tbsp Amlou Bliss', 'Slivered almonds'], instructions: ['Simmer oats until soft and thick.', 'Stir in Amlou off the heat.', 'Top with extra roasted slivered almonds.'] },
];

function ShopSection({ onQuickAdd, onShopNow, onProductClick }: any) {
  const { t } = useTranslation();
  const { formatPrice } = useCurrency();
  return (
    <div
      id="product-grid"
      className="w-full max-w-7xl mx-auto px-4 py-24 flex flex-col items-center z-40 relative bg-[#F5F5F1]"
    >
      <div className="text-center mb-16 max-w-2xl px-4">
        <RevealText text={t('shopTitle')} className="font-serif text-4xl md:text-5xl text-black mb-6" />
        <RevealText text={t('shopSub')} delay={0.2} className="font-sans text-black/70 text-lg leading-relaxed" />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 w-full">
        {PRODUCTS.map((p, i) => (
          <motion.div
            key={p.id}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: false, margin: "-50px" }}
            transition={{ delay: i * 0.05, duration: 0.8 }}
            className="group relative bg-white rounded-3xl p-4 cursor-pointer shadow-sm hover:shadow-xl transition-all duration-500 hover:-translate-y-2"
            onClick={(e: any) => {
              if (e.target.closest('button')) return;
              onProductClick(p);
            }}
          >
            <div className="w-full aspect-[4/5] bg-gray-100 rounded-2xl mb-4 overflow-hidden relative">
              <img src={p.img} alt={t(p.title_key)} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
            </div>
            <div className="flex flex-col items-center text-center flex-1">
              <h4 className="font-bold text-lg">{t(p.title_key)}</h4>
              <p className="text-sm text-gray-500 mt-1 mb-6">{formatPrice(p.price)}</p>
            </div>
            <div className="flex gap-2 w-full mt-auto relative z-[60]">
              <motion.button whileTap={{ scale: 0.95 }} onClick={(e: any) => { e.stopPropagation(); onQuickAdd(p, 1); }} className="flex-1 py-3 rounded-xl border border-[#ff8a00] text-[#ff8a00] font-bold text-sm hover:bg-[#ff8a00] hover:text-white transition-colors">{t('quickAdd')}</motion.button>
              <motion.button whileTap={{ scale: 0.95 }} onClick={(e: any) => { e.stopPropagation(); onShopNow(p, 1); }} className="flex-1 py-3 rounded-xl bg-[#ff8a00] text-white font-bold text-sm hover:bg-[#e67a00] transition-colors">{t('buyNow')}</motion.button>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

function CartDrawer({ isOpen, onClose, cart, updateQty, onCheckout }: any) {
  const { t } = useTranslation();
  const { formatPrice } = useCurrency();
  const total = cart.reduce((sum: number, item: any) => sum + item.price * item.qty, 0);
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[110]" onClick={onClose} />
          <motion.div initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} transition={{ type: 'spring', damping: 25, stiffness: 200 }} className="fixed top-0 right-0 h-full w-full max-w-md bg-white z-[120] shadow-2xl flex flex-col">
            <div className="p-6 border-b flex justify-between items-center">
              <h2 className="font-serif text-2xl">{t('cartTitle')}</h2>
              <button onClick={onClose} className="hover:rotate-90 transition-transform"><X/></button>
            </div>
            <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-6">
              {cart.map((item: any) => (
                <div key={item.id} className="flex gap-4 items-center">
                  <img src={item.img} className="w-20 h-20 object-cover rounded-xl" />
                  <div className="flex-1">
                    <h4 className="font-bold">{t(item.id + '_title')}</h4>
                    <p className="text-gray-500">{formatPrice(item.price)}</p>
                  </div>
                  <div className="flex items-center gap-3 bg-gray-100 rounded-full px-3 py-1">
                    <button onClick={() => updateQty(item.id, -1)} className="text-gray-500 hover:text-black">-</button>
                    <span className="font-bold text-sm w-4 text-center">{item.qty}</span>
                    <button onClick={() => updateQty(item.id, 1)} className="text-gray-500 hover:text-black">+</button>
                  </div>
                </div>
              ))}
              {cart.length === 0 && <p className="text-gray-500 text-center mt-10">{t('cartEmpty')}</p>}
            </div>
            <div className="p-6 border-t bg-gray-50">
              <div className="flex justify-between mb-6 font-bold text-lg">
                <span>{t('cartTotal')}</span>
                <span>{formatPrice(total)}</span>
              </div>
              <motion.button whileTap={{ scale: 0.98 }} onClick={onCheckout} disabled={cart.length === 0} className="w-full py-4 rounded-xl bg-[#ff8a00] text-white font-bold hover:bg-[#e67a00] transition-colors disabled:opacity-50">{t('checkout')}</motion.button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

function ProductDetailModal({ product, onClose, onAddToCart, onBuyNow, onProductClick }: any) {
  const { t } = useTranslation();
  const { formatPrice } = useCurrency();
  const [qty, setQty] = useState(1);

  useEffect(() => {
    setQty(1);
  }, [product]);

  return (
        <motion.div key="product-modal" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, transition: { duration: 0.3 } }} className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-8 bg-black/40 backdrop-blur-md" onClick={onClose}>
           <motion.div initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 20, opacity: 0, transition: { duration: 0.3 } }} className="bg-[#F5F5F1] w-full max-w-6xl h-[95vh] rounded-[2rem] overflow-hidden flex flex-col relative shadow-2xl" onClick={e => e.stopPropagation()}>
              <button onClick={onClose} className="absolute top-6 right-6 z-50 bg-white/50 backdrop-blur p-2 rounded-full hover:bg-white transition-colors"><X className="w-6 h-6 text-black"/></button>
              <div className="flex flex-col md:flex-row h-full overflow-y-auto">
               <div className="w-full md:w-1/2 h-[50vh] md:h-full bg-gray-200 relative">
                 <img src={product.img} className="w-full h-full object-cover" />
               </div>
               <div className="w-full md:w-1/2 p-8 md:p-16 flex flex-col justify-center">
                  <h2 className="font-serif text-4xl md:text-5xl mb-4">{t(product.id + '_title')}</h2>
                  <p className="text-2xl font-light mb-8">{formatPrice(product.price)}</p>
                  
                  <div className="flex flex-col gap-6 mb-10">
                    {t(product.id + '_desc').split('|').map((part: string, idx: number) => {
                      if (idx === 0) return <p key={idx} className="text-xl font-medium text-black leading-relaxed">{part}</p>;
                      if (idx === 1) return (
                        <div key={idx} className="bg-white/60 border border-gray-200/60 p-5 rounded-2xl relative overflow-hidden">
                          <div className="absolute top-0 right-0 w-16 h-16 bg-[#ff8a00]/10 rounded-bl-full pointer-events-none" />
                          <p className="text-[11px] font-bold text-[#ff8a00] mb-2 tracking-widest uppercase flex items-center gap-2">
                            <span className="w-1.5 h-1.5 bg-[#ff8a00] rounded-full inline-block" />
                            {t('ingredientsLabel') || 'Ingredients'}
                          </p>
                          <p className="text-gray-700 leading-relaxed">{part}</p>
                        </div>
                      );
                      if (idx === 2) return <p key={idx} className="text-xl italic text-[#ff8a00] font-serif leading-relaxed px-4 border-l-2 border-[#ff8a00]/30 py-1">{part}</p>;
                      if (idx === 3) return (
                         <div key={idx} className="flex gap-4 items-start bg-[#1a1a1a]/5 p-5 rounded-2xl">
                           <div className="w-8 h-8 rounded-full bg-[#1a1a1a] text-white flex items-center justify-center shrink-0 mt-0.5">
                             <Heart className="w-4 h-4 fill-white" />
                           </div>
                           <p className="text-gray-800 leading-relaxed font-medium">{part}</p>
                         </div>
                      );
                      if (idx === 4) return <p key={idx} className="text-sm font-bold tracking-wider uppercase text-gray-400 mt-2">{part}</p>;
                      return <p key={idx} className="text-gray-600 leading-relaxed">{part}</p>;
                    })}
                  </div>
                  
                  {/* Quantity Selector */}
                  <div className="flex items-center gap-4 mb-10">
                    <span className="font-bold text-sm tracking-wider uppercase text-gray-500">Quantity</span>
                    <div className="flex items-center gap-4 bg-white border border-gray-200 rounded-full px-4 py-2">
                      <button onClick={() => setQty(Math.max(1, qty - 1))} className="text-gray-500 hover:text-black hover:scale-110 transition-all font-medium text-lg">-</button>
                      <span className="font-bold w-6 text-center">{qty}</span>
                      <button onClick={() => setQty(qty + 1)} className="text-gray-500 hover:text-black hover:scale-110 transition-all font-medium text-lg">+</button>
                    </div>
                  </div>

                  <div className="flex gap-4 mb-16">
                    <motion.button whileTap={{ scale: 0.95 }} onClick={() => onAddToCart(product, qty)} className="flex-1 py-4 rounded-xl border-2 border-[#ff8a00] text-[#ff8a00] font-bold hover:bg-[#ff8a00] hover:text-white transition-colors">{t('quickAdd')}</motion.button>
                    <motion.button whileTap={{ scale: 0.95 }} onClick={() => onBuyNow(product, qty)} className="flex-1 py-4 rounded-xl bg-[#ff8a00] text-white font-bold hover:bg-[#e67a00] transition-colors">{t('buyNow')}</motion.button>
                  </div>
                  <div>
                    <h4 className="font-bold mb-4 uppercase tracking-wider text-sm text-gray-400">Other Products</h4>
                    <div className="grid grid-cols-3 gap-4">
                       {PRODUCTS.filter(p => p.id !== product.id).slice(0,3).map(p => (
                         <div key={p.id} onClick={() => onProductClick(p)} className="cursor-pointer group">
                           <img src={p.img} className="w-full aspect-square object-cover rounded-xl mb-2 group-hover:opacity-80 transition-opacity" />
                           <p className="text-xs font-bold truncate">{t(p.title_key)}</p>
                         </div>
                       ))}
                    </div>
                  </div>
               </div>
            </div>
         </motion.div>
      </motion.div>
  );
}

function CheckoutModal({ isOpen, onClose, cartTotal, cartInfo }: any) {
  const { t, isRTL } = useTranslation();
  const { formatPrice } = useCurrency();
  const [isSuccess, setIsSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [details, setDetails] = useState({ name: '', address: '', city: '', phone: '' });

  const encode = (data: any) => {
    return Object.keys(data)
      .map(key => encodeURIComponent(key) + "=" + encodeURIComponent(data[key]))
      .join("&");
  }

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    if (!details.phone) return;
    setIsSubmitting(true);
    
    try {
      await fetch("/", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: encode({
          "form-name": "Amlou_Orders",
          ...details,
          Quantity: cartInfo || "1",
          TotalDue: cartTotal
        })
      });
      setIsSuccess(true);
      setTimeout(() => {
        setIsSuccess(false);
        onClose(true);
      }, 3000);
    } catch (error) {
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div key="checkout-modal" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[130] flex items-center justify-center p-4 md:p-8 bg-black/60 backdrop-blur-md">
           <motion.div initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 20 }} className="bg-white w-full max-w-4xl rounded-[2rem] overflow-hidden relative shadow-2xl flex flex-col md:flex-row max-h-[90vh]">
              {!isSuccess && <button onClick={() => onClose(false)} className={`absolute top-6 ${isRTL ? 'left-6' : 'right-6'} text-gray-400 hover:text-black z-50 bg-white/80 p-2 rounded-full`}><X/></button>}
              
              {isSuccess ? (
              <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="flex flex-col items-center justify-center py-24 w-full">
                <div className="w-32 h-32 bg-[#ff8a00]/10 rounded-full flex items-center justify-center mb-10 relative">
                  <motion.div 
                    animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0.8, 0.5] }} 
                    transition={{ duration: 2, repeat: Infinity }}
                    className="absolute inset-0 bg-[#ff8a00] rounded-full opacity-20"
                  />
                  <motion.div 
                    initial={{ scale: 0, rotate: -45 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ type: "spring", damping: 10, stiffness: 100 }}
                  >
                    <Heart className="w-16 h-16 text-[#ff8a00] fill-[#ff8a00]" />
                  </motion.div>
                </div>
                <h2 className="font-serif text-4xl mb-4 text-black text-center">{t('orderSecured')}</h2>
                <p className="text-gray-500 text-lg text-center px-6">{t('orderWay')}</p>
              </motion.div>
            ) : (
              <>
                <div className="w-full md:w-[40%] bg-gray-50 p-8 md:p-12 flex flex-col justify-between border-b md:border-b-0 md:border-r border-gray-100">
                  <div>
                    <h3 className="font-serif text-2xl mb-8">{t('orderSummary')}</h3>
                    <div className="flex justify-between items-center mb-4 text-gray-600">
                      <span>{t('subtotal')}</span>
                      <span>{formatPrice(cartTotal)}</span>
                    </div>
                    <div className="flex justify-between items-center mb-4 text-gray-600">
                      <span>{t('shipping')}</span>
                      <span className="text-green-600 font-medium">{t('free')}</span>
                    </div>
                    <div className="flex justify-between items-center mt-8 pt-6 border-t border-gray-200">
                      <span className="font-medium text-lg">{t('totalDue')}</span>
                      <span className="font-bold text-3xl font-serif">{formatPrice(cartTotal)}</span>
                    </div>
                  </div>
                  
                  <div className="mt-12 space-y-4 hidden md:block">
                    <div className="flex items-center gap-3 text-sm text-gray-500">
                      <svg className="w-5 h-5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                      {t('secureNote')}
                    </div>
                    <div className="flex items-center gap-3 text-sm text-gray-500">
                      <svg className="w-5 h-5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" /></svg>
                      {t('packagingNote')}
                    </div>
                  </div>
                </div>

                <div className="w-full md:w-[60%] p-8 md:p-12 overflow-y-auto">
                  <h2 className="font-serif text-3xl mb-8">{t('deliveryDetails')}</h2>
                  <form name="Amlou_Orders" data-netlify="true" onSubmit={handleSubmit} className="flex flex-col gap-6">
                    <input type="hidden" name="form-name" value="Amlou_Orders" />
                    <input type="hidden" name="Quantity" value={cartInfo || "1"} />
                    <input type="hidden" name="TotalDue" value={cartTotal} />
                    
                    <div className="space-y-4">
                      <div>
                        <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 ml-1">{t('checkoutName')}</label>
                        <input name="name" type="text" placeholder={t('checkoutNamePlaceholder')} value={details.name} onChange={e => setDetails({...details, name: e.target.value})} className="w-full px-5 py-4 rounded-2xl bg-gray-50 border border-gray-100 focus:bg-white focus:border-[#ff8a00] focus:ring-4 focus:ring-[#ff8a00]/10 transition-all outline-none text-lg" required />
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 ml-1">{t('checkoutAdd')}</label>
                          <input name="address" type="text" placeholder={t('checkoutAddPlaceholder')} value={details.address} onChange={e => setDetails({...details, address: e.target.value})} className="w-full px-5 py-4 rounded-2xl bg-gray-50 border border-gray-100 focus:bg-white focus:border-[#ff8a00] focus:ring-4 focus:ring-[#ff8a00]/10 transition-all outline-none text-lg" required />
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 ml-1">{t('checkoutCity')}</label>
                          <input name="city" type="text" placeholder={t('checkoutCityPlaceholder')} value={details.city} onChange={e => setDetails({...details, city: e.target.value})} className="w-full px-5 py-4 rounded-2xl bg-gray-50 border border-gray-100 focus:bg-white focus:border-[#ff8a00] focus:ring-4 focus:ring-[#ff8a00]/10 transition-all outline-none text-lg" required />
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 ml-1">{t('checkoutPhone')} <span className="text-[#ff8a00]">*</span></label>
                        <input name="phone" type="tel" placeholder={t('checkoutPhonePlaceholder')} value={details.phone} onChange={e => setDetails({...details, phone: e.target.value})} className="w-full px-5 py-4 rounded-2xl bg-gray-50 border border-gray-100 focus:bg-white focus:border-[#ff8a00] focus:ring-4 focus:ring-[#ff8a00]/10 transition-all outline-none text-lg" required />
                      </div>
                    </div>
                    
                    <motion.button disabled={isSubmitting} whileTap={{ scale: 0.98 }} type="submit" className="w-full py-5 mt-6 rounded-2xl bg-[#1a1a1a] text-white font-bold text-lg hover:bg-black hover:shadow-xl hover:-translate-y-1 transition-all flex items-center justify-center gap-3 group uppercase disabled:opacity-70 disabled:cursor-not-allowed">
                      {isSubmitting ? (t('sending') || 'Sending...') : t('checkoutComplete')}
                      {!isSubmitting && <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />}
                    </motion.button>
                    <p className="text-center text-xs text-gray-400 mt-2">{t('checkoutTerms')}</p>
                  </form>
                </div>
              </>
            )}
         </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

const SwipeCard = memo(({ card, index, isTop, onSwipe, exitDir }: any) => {
  const { t } = useTranslation();
  const x = useMotionValue(0);
  const rotate = useTransform(x, [-100, 100], [-10, 10]);
  
  const likeOpacity = useTransform(x, [20, 80], [0, 1]);
  const nopeOpacity = useTransform(x, [-20, -80], [0, 1]);
  const likeScale = useTransform(x, [20, 80], [0.8, 1.1]);
  const nopeScale = useTransform(x, [-20, -80], [0.8, 1.1]);

  const greenOverlay = useTransform(x, [0, 150], [0, 0.3]);
  const redOverlay = useTransform(x, [0, -150], [0, 0.3]);

  const handleDragEnd = (event: any, info: any) => {
    const threshold = 60;
    const velocityThreshold = 180;
    if (info.offset.x > threshold || info.velocity.x > velocityThreshold) {
      onSwipe(card.uid, 'right');
    } else if (info.offset.x < -threshold || info.velocity.x < -velocityThreshold) {
      onSwipe(card.uid, 'left');
    }
  };

  const handleHeart = (e: any) => {
    e.stopPropagation();
    onSwipe(card.uid, 'right');
  };

  const handleX = (e: any) => {
    e.stopPropagation();
    onSwipe(card.uid, 'left');
  };

  return (
    <motion.div
      className="absolute w-full max-w-[340px] h-[520px] bg-[#EAE8E3] rounded-[2rem] shadow-2xl overflow-hidden origin-bottom z-10 select-none"
      style={{ 
        x, 
        rotate, 
        zIndex: index + 10,
        touchAction: "none"
      }}
      drag={isTop ? "x" : false}
      dragConstraints={{ left: 0, right: 0 }}
      dragElastic={0.9}
      dragMomentum={false}
      onDragEnd={handleDragEnd}
      whileHover={isTop ? { cursor: 'grab' } : {}}
      whileTap={isTop ? { scale: 1.02, cursor: 'grabbing' } : {}}
      whileDrag={{ scale: 1.05, cursor: 'grabbing' }}
      custom={exitDir}
      variants={{
        exit: (dir: number) => ({
          x: dir || -800,
          opacity: 0,
          rotate: (dir || -800) > 0 ? 30 : -30,
          transition: { duration: 0.5, ease: "easeOut" },
          pointerEvents: 'none'
        })
      }}
      initial={{ scale: 0.8, opacity: 0, y: 50 }}
      animate={{ 
        scale: isTop ? 1 : 0.95 - (4 - index) * 0.04, 
        opacity: 1, 
        y: isTop ? 0 : (4 - index) * 12 
      }}
      exit="exit"
      transition={{ type: "spring", stiffness: 300, damping: 25 }}
    >
      <motion.div style={{ opacity: greenOverlay }} className="absolute inset-0 bg-green-500 z-10 pointer-events-none" />
      <motion.div style={{ opacity: redOverlay }} className="absolute inset-0 bg-red-500 z-10 pointer-events-none" />

      <motion.div style={{ opacity: likeOpacity, scale: likeScale }} className="absolute top-12 left-6 z-20 border-[6px] border-green-500 text-green-500 font-black text-4xl px-4 py-2 rounded-xl rotate-[-15deg] tracking-widest pointer-events-none bg-white/95 shadow-2xl">{t('swipeCheck')}</motion.div>
      <motion.div style={{ opacity: nopeOpacity, scale: nopeScale }} className="absolute top-12 right-6 z-20 border-[6px] border-red-500 text-red-500 font-black text-3xl px-4 py-2 rounded-xl rotate-[15deg] tracking-widest pointer-events-none bg-white/95 shadow-2xl">{t('swipeReject')}</motion.div>

      <div className="h-[70%] w-full relative bg-gray-200">
        <img src={card.img} alt={t(card.title_key)} className="w-full h-full object-cover" draggable={false} />
        <div className="absolute inset-0 bg-gradient-to-b from-black/5 to-transparent pointer-events-none"></div>
      </div>
      
      <div className="h-[30%] w-full p-6 flex flex-col justify-center relative bg-[#EAE8E3]">
        {isTop && (
          <div className="absolute top-0 right-0 p-6 pointer-events-auto w-full flex justify-between z-50">
            <motion.button 
              whileHover={{ scale: 1.15 }}
              whileTap={{ scale: 0.9, rotate: -15 }}
              onClick={handleX}
              className="absolute -top-8 left-6 w-16 h-16 bg-white rounded-full shadow-[0_8px_20px_rgba(0,0,0,0.12)] flex items-center justify-center text-red-500 hover:shadow-[0_8px_25px_rgba(239,68,68,0.3)] transition-shadow"
            >
              <X className="w-8 h-8" strokeWidth={3} />
            </motion.button>
            <motion.button 
              whileHover={{ scale: 1.15 }}
              whileTap={{ scale: 0.9, rotate: 15 }}
              onClick={handleHeart}
              className="absolute -top-8 right-6 w-16 h-16 bg-white rounded-full shadow-[0_8px_20px_rgba(0,0,0,0.12)] flex items-center justify-center text-green-500 hover:shadow-[0_8px_25px_rgba(34,197,94,0.3)] transition-shadow"
            >
              <Heart className="w-8 h-8 fill-current" />
            </motion.button>
          </div>
        )}
        <h3 className="font-sans font-bold text-[22px] text-black mb-1.5 leading-tight select-none">{t(card.title_key)}</h3>
        <p className="font-sans text-[15px] text-black/70 leading-snug select-none">{t(card.desc_key)}</p>
      </div>
    </motion.div>
  );
});

function SwipeSection({ onSwipeComplete, onQuickAdd, onShopNow, onProductClick }: any) {
  const { t } = useTranslation();
  const { formatPrice } = useCurrency();
  const [cards, setCards] = useState(() => CARD_DATA.map(c => ({ ...c, uid: String(c.id) })));
  const [showProducts, setShowProducts] = useState(false);
  const [exitDir, setExitDir] = useState(800);

  const handleSwipe = useCallback((uid: string, dir: 'left' | 'right') => {
    setExitDir(dir === 'right' ? 800 : -800);
    setCards(prev => {
      const remaining = prev.filter(c => c.uid !== uid);
      if (remaining.length === 0) {
        setTimeout(() => setShowProducts(true), 400);
        if (onSwipeComplete) onSwipeComplete();
      }
      return remaining;
    });
  }, [onSwipeComplete]);

  return (
    <section id="swipe-section" className="relative w-full min-h-[85vh] bg-[#F5F5F1] py-20 overflow-hidden flex flex-col items-center justify-center border-t border-black/5 z-30">
      <div className="text-center mb-12 z-10 px-6">
        <RevealText text={t('swipeTitle')} className="font-serif text-4xl md:text-5xl text-black mb-4" />
        <RevealText text={t('swipeSub')} delay={0.3} className="font-sans text-black/50 uppercase tracking-widest text-[11px] font-bold" />
      </div>

      <div className="relative w-full flex flex-col items-center justify-center min-h-[520px]">
        <div className="relative w-full max-w-[340px] h-[520px] flex justify-center items-center">
          <AnimatePresence custom={exitDir}>
            {cards.map((card, index) => (
              <SwipeCard 
                key={card.uid} 
                card={card} 
                index={index} 
                isTop={index === cards.length - 1} 
                onSwipe={handleSwipe}
                exitDir={exitDir}
              />
            ))}
          </AnimatePresence>
        </div>

        <AnimatePresence>
          {showProducts && (
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="absolute inset-0 w-full h-full flex flex-col items-center justify-center z-40 bg-[#F5F5F1]"
            >
              <div className="md:mt-16 mb-10">
                <RevealText text={t('blissCol')} className="font-serif text-3xl md:text-4xl text-black text-center px-4" />
              </div>
              <div className="grid grid-cols-2 gap-4 md:gap-8 w-full max-w-4xl px-4 md:px-8 mx-auto">
                {PRODUCTS.slice(0, 2).map(p => (
                  <div key={p.id} className="bg-white p-5 rounded-3xl shadow-sm text-center group cursor-pointer hover:shadow-xl transition-all relative flex flex-col h-full overflow-hidden" onClick={(e: any) => {
                    if (e.target.closest('button')) return;
                    onProductClick(p);
                  }}>
                    <div className="w-full aspect-square bg-gray-100 rounded-2xl mb-4 overflow-hidden relative">
                      <img src={p.img} alt={t(p.title_key)} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                    </div>
                    <div className="flex-1 flex flex-col items-center">
                      <h4 className="font-bold text-lg md:text-xl">{t(p.title_key)}</h4>
                      <p className="text-sm text-gray-400 mt-1 mb-6">{formatPrice(p.price)}</p>
                      <div className="mt-auto w-full">
                        <motion.button 
                          whileTap={{ scale: 0.95 }} 
                          onClick={(e: any) => { e.stopPropagation(); onQuickAdd(p, 1); }} 
                          className="w-full py-4 rounded-xl bg-[#1a1a1a] text-white font-bold text-sm hover:bg-[#ff8a00] transition-colors"
                        >
                          {t('quickAdd')}
                        </motion.button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
}

function MenuOverlay({ isOpen, onClose, onProductClick, onRecipesClick }: any) {
  const { t, isRTL } = useTranslation();
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
           initial={{ y: '-100%' }}
           animate={{ y: 0 }}
           exit={{ y: '-100%' }}
           transition={{ duration: 0.5, ease: [0.33, 1, 0.68, 1] }}
           className="fixed inset-0 bg-white z-[90] flex flex-col pt-32 px-6 md:px-12 overflow-y-auto"
        >
           <div className="w-full max-w-2xl mx-auto flex flex-col pt-8 md:pt-12 min-h-full pb-12">
             <motion.h2 
               initial={{ opacity: 0, y: 20 }}
               animate={{ opacity: 1, y: 0 }}
               transition={{ delay: 0.2 }}
               className="text-5xl md:text-7xl font-serif text-black mb-10 cursor-pointer hover:opacity-70 transition-opacity"
               onClick={() => {
                 onClose();
                 setTimeout(() => {
                   document.getElementById('product-grid')?.scrollIntoView({ behavior: 'smooth' });
                 }, 100);
               }}
             >
               {t('menuShop')}
             </motion.h2>
             
             <div className="flex flex-col gap-6 ml-4 md:ml-8 mb-16">
               {PRODUCTS.map((p, i) => (
                 <motion.div
                   key={p.id}
                   initial={{ opacity: 0, y: 20 }}
                   animate={{ opacity: 1, y: 0 }}
                   transition={{ delay: 0.3 + i * 0.1 }}
                   onClick={() => { onClose(); onProductClick(p); }}
                   className="flex items-center justify-between group cursor-pointer border-b border-gray-100 pb-4"
                 >
                   <div className="flex items-center gap-6">
                     <img src={p.img} alt={t(p.title_key)} className="w-16 h-16 md:w-20 md:h-20 rounded-2xl object-cover shadow-sm group-hover:scale-105 transition-transform" />
                     <span className="text-lg md:text-2xl font-medium tracking-wide group-hover:text-[#ff8a00] transition-colors">{t(p.title_key)}</span>
                   </div>
                   <ArrowRight className={`text-[#ff8a00] opacity-0 group-hover:opacity-100 transition-all w-6 h-6 md:w-8 md:h-8 ${isRTL ? 'rotate-180 translate-x-4 group-hover:translate-x-0' : '-translate-x-4 group-hover:translate-x-0'}`} />
                 </motion.div>
               ))}
             </div>

             <motion.h2 
               initial={{ opacity: 0, y: 20 }}
               animate={{ opacity: 1, y: 0 }}
               transition={{ delay: 0.7 }}
               onClick={() => { onClose(); onRecipesClick(); }}
               className="text-5xl md:text-7xl font-serif text-black mb-16 cursor-pointer hover:opacity-70 transition-opacity"
             >
               {t('menuRecipes')}
             </motion.h2>

             {/* Dynamic Social Icons Footer attached firmly to bottom */}
             <motion.div 
               initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.8 }} 
               className="mt-auto pt-8 flex items-center justify-center gap-8 text-black"
             >
               <a href="https://www.tiktok.com/@amlou.bliss" target="_blank" rel="noopener noreferrer" className="hover:text-[#ff8a00] hover:scale-110 transition-all"><TikTokIcon className="w-6 h-6" /></a>
               <a href="https://www.instagram.com/amloubliss" target="_blank" rel="noopener noreferrer" className="hover:text-[#ff8a00] hover:scale-110 transition-all"><Instagram className="w-6 h-6" /></a>
               <a href="https://www.facebook.com/profile.php?id=61560329213924" target="_blank" rel="noopener noreferrer" className="hover:text-[#ff8a00] hover:scale-110 transition-all"><Facebook className="w-6 h-6" /></a>
               <a href="https://wa.me/212754377585" target="_blank" rel="noopener noreferrer" className="hover:text-[#ff8a00] hover:scale-110 transition-all"><MessageCircle className="w-6 h-6" /></a>
               <a href="mailto:amloubliss@proton.me" className="hover:text-[#ff8a00] hover:scale-110 transition-all"><Mail className="w-6 h-6" /></a>
             </motion.div>
           </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default function App() {
  const [lang, setLang] = useState('en');
  const [currency, setCurrency] = useState('USD');
  const [cart, setCart] = useState<any[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isRecipeListOpen, setIsRecipeListOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [selectedRecipe, setSelectedRecipe] = useState<any>(null);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [checkoutTotal, setCheckoutTotal] = useState(0);

  useEffect(() => {
    if (isCartOpen || isCheckoutOpen || isMenuOpen || selectedProduct || isRecipeListOpen || selectedRecipe) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
    return () => { document.body.style.overflow = 'auto'; };
  }, [isCartOpen, isCheckoutOpen, isMenuOpen, selectedProduct, isRecipeListOpen, selectedRecipe]);

  const cartCount = cart.reduce((sum, item) => sum + item.qty, 0);
  const cartTotal = cart.reduce((sum, item) => sum + item.price * item.qty, 0);

  const addToCart = (product: any, qty: number = 1) => {
    setCart(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) return prev.map(item => item.id === product.id ? { ...item, qty: item.qty + qty } : item);
      return [...prev, { ...product, qty }];
    });
    setIsCartOpen(true);
  };

  const updateQty = (id: string, delta: number) => {
    setCart(prev => prev.map(item => {
      if (item.id === id) {
        const newQty = Math.max(0, item.qty + delta);
        return { ...item, qty: newQty };
      }
      return item;
    }).filter(item => item.qty > 0));
  };

  const handleShopNow = (product: any, qty: number = 1) => {
    setCheckoutTotal(product.price * qty);
    setIsCheckoutOpen(true);
  };

  const handleCheckout = () => {
    setCheckoutTotal(cartTotal);
    setIsCartOpen(false);
    setIsCheckoutOpen(true);
  };

  const clearCart = () => setCart([]);

  const t = (key: string) => DICT[lang]?.[key] || DICT['en'][key] || key;
  const isRTL = lang === 'ar';

  const handleCheckoutClose = (success: boolean) => {
    setIsCheckoutOpen(false);
    if (success) setCart([]);
  };

  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  });

  return (
    <LangContext.Provider value={{ lang, setLang }}>
      <CurrencyContext.Provider value={{ currency, setCurrency }}>
        <motion.div 
          className="fixed top-0 left-0 right-0 h-1 bg-[#ff8a00] z-[200] origin-left" 
          style={{ scaleX }} 
        />
        <div className={`min-h-screen bg-[#F5F5F1] ${lang === 'ar' ? 'font-arabic' : 'font-sans'} selection:bg-[#ff8a00] selection:text-white ${isRTL ? 'rtl' : 'ltr'}`} dir={isRTL ? 'rtl' : 'ltr'}>
          <NavBar cartCount={cartCount} onOpenCart={() => setIsCartOpen(true)} isMenuOpen={isMenuOpen} setIsMenuOpen={setIsMenuOpen} />
          
          <MenuOverlay isOpen={isMenuOpen} onClose={() => setIsMenuOpen(false)} onProductClick={setSelectedProduct} onRecipesClick={() => setIsRecipeListOpen(true)} />

          <RecipeListModal isOpen={isRecipeListOpen} onClose={() => setIsRecipeListOpen(false)} onSelectRecipe={setSelectedRecipe} />
          
          <AnimatePresence>
            {selectedRecipe && <RecipeDetailModal key="rec-modal" recipe={selectedRecipe} onClose={() => setSelectedRecipe(null)} />}
          </AnimatePresence>
          
          <CartDrawer isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} cart={cart} updateQty={updateQty} onCheckout={handleCheckout} />
          
          <AnimatePresence>
            {selectedProduct && <ProductDetailModal key="prod-modal" product={selectedProduct} onClose={() => setSelectedProduct(null)} onAddToCart={addToCart} onBuyNow={handleShopNow} onProductClick={setSelectedProduct} />}
          </AnimatePresence>
          
          <CheckoutModal isOpen={isCheckoutOpen} onClose={handleCheckoutClose} cartTotal={checkoutTotal} cartInfo={cart.map((item: any) => `${item.qty}x ${item.id}`).join(', ')} />

        {/* Hero Section */}
        <section className="relative h-[92vh] w-full overflow-hidden rounded-b-[2rem] md:rounded-b-[3rem] bg-[#1a1a1a]">
          {/* Video Background with Parallax */}
          <motion.div 
            style={{ 
              y: useTransform(scrollYProgress, [0, 0.5], [0, 150]) 
            }}
            className="absolute inset-0 w-full h-full will-change-transform"
          >
            <video
              autoPlay
              loop
              muted
              playsInline
              poster="https://images.unsplash.com/photo-1555507036-ab1f40ce88cb?auto=format&fit=crop&q=80&w=2000"
              className="absolute inset-0 w-full h-full object-cover"
            >
              <source src="https://assets.mixkit.co/videos/preview/mixkit-honey-pouring-from-a-wooden-dipper-into-a-bowl-43180-large.mp4" type="video/mp4" />
              <source src="https://ayxim7ludyxstzda.public.blob.vercel-storage.com/amloubliss.mp4" type="video/mp4" />
            </video>
          </motion.div>
          
          <div className="absolute inset-0 bg-black/40 backdrop-brightness-75"></div>
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,rgba(0,0,0,0.6)_100%)] pointer-events-none"></div>

          <div className="relative z-10 flex flex-col items-center justify-between h-full px-4 pt-28 pb-8">
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1.5, ease: [0.33, 1, 0.68, 1] }}
              className="flex-1 flex items-center justify-center w-full"
            >
              <motion.h1 
                className="font-logo text-white text-[32vw] md:text-[18vw] leading-[0.8] tracking-wide lowercase drop-shadow-2xl flex flex-col items-center"
              >
                <span>amlou</span>
                <span>bliss</span>
              </motion.h1>
            </motion.div>
            
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1.5, delay: 0.3, ease: [0.33, 1, 0.68, 1] }}
              className="flex flex-col items-center gap-6 md:gap-8 w-full"
            >
              <div className="font-serif text-white/95 text-[28px] md:text-5xl text-center leading-[1.1] tracking-tight drop-shadow-lg flex flex-col items-center gap-2">
                <RevealText text={t('heroTagline1')} />
                <RevealText text={t('heroTagline2')} delay={0.4} />
              </div>

              <motion.button 
                whileTap={{ scale: 0.95 }}
                onClick={() => document.getElementById('product-grid')?.scrollIntoView({ behavior: 'smooth' })}
                className="bg-[#ff8a00] hover:bg-[#ff9900] hover:scale-[1.03] transition-all duration-300 text-black font-medium text-lg py-4 px-10 rounded-full flex items-center justify-center gap-3 shadow-[0_0_40px_rgba(255,138,0,0.25)] hover:shadow-[0_0_60px_rgba(255,138,0,0.4)]"
              >
                <span>{t('orderNow')}</span>
                <ArrowRight className={`w-5 h-5 ${isRTL ? 'rotate-180' : ''}`} />
              </motion.button>
              
              <div className="flex flex-col items-center gap-2 opacity-80 mt-2">
                <span className="text-white/70 text-[10px] tracking-[0.2em] uppercase font-semibold">{t('scroll')}</span>
                <div className="w-[1px] h-8 md:h-10 bg-white/20 relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-full h-full bg-white animate-scroll-down"></div>
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Content Section */}
        <section 
          className="py-24 px-6 md:px-12 lg:px-24 bg-[#F5F5F1] text-center flex flex-col items-center"
        >
          <RevealText text={t('authTitle1')} className="font-serif text-[40px] md:text-6xl text-black md:mb-2 tracking-tight leading-[1.1] max-w-3xl" />
          <RevealText text={t('authTitle2')} delay={0.2} className="font-serif text-[40px] md:text-6xl text-black mb-8 tracking-tight leading-[1.1] max-w-3xl" />
          <RevealText text={t('authDesc')} delay={0.4} fast={true} className="font-sans text-[17px] md:text-xl text-black max-w-[800px] leading-[1.6]" />
        </section>

        <SwipeSection onQuickAdd={addToCart} onShopNow={handleShopNow} onProductClick={setSelectedProduct} />
        <ShopSection onQuickAdd={addToCart} onShopNow={handleShopNow} onProductClick={setSelectedProduct} />
        <RecipeHero onOpenRecipes={() => setIsRecipeListOpen(true)} />
        <Footer onOpenRecipes={() => setIsRecipeListOpen(true)} />
      </div>
    </CurrencyContext.Provider>
  </LangContext.Provider>
  );
}

function Footer({ onOpenRecipes }: any) {
  return (
    <motion.footer 
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: false }}
      transition={{ duration: 1 }}
      className="w-full bg-white pt-24 pb-12 flex flex-col items-center"
    >
      <div className="flex flex-col items-center mb-16">
        <h1 className="font-logo text-black text-5xl md:text-7xl leading-[0.8] tracking-wide lowercase flex flex-col items-center mb-12">
          <RevealText text="amlou" isLogo={true} />
          <RevealText text="bliss" isLogo={true} delay={0.2} />
        </h1>
        
        <nav className="flex flex-col items-center gap-6 text-center">
          {[
            { label: 'shop our products', id: 'product-grid' },
            { label: 'swipe on some ingredients', id: 'swipe-section' },
            { label: 'check our recipes', id: 'recipes' }
          ].map((link, i) => (
            <motion.button 
              key={link.id}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: false }}
              transition={{ delay: i * 0.1 }}
              whileHover={{ scale: 1.05 }}
              onClick={() => document.getElementById(link.id)?.scrollIntoView({ behavior: 'smooth' })} 
              className="font-sans text-gray-600 hover:text-[#ff8a00] transition-all text-lg md:text-xl font-medium tracking-wide"
            >
              {link.label}
            </motion.button>
          ))}
        </nav>
      </div>

      <div className="flex items-center gap-6 mb-12">
        <a href="https://www.tiktok.com/@amlou.bliss" target="_blank" rel="noopener noreferrer" className="w-12 h-12 rounded-full border border-gray-100 shadow-sm flex items-center justify-center text-gray-600 hover:text-[#ff8a00] hover:border-[#ff8a00] hover:shadow-md hover:scale-110 transition-all bg-white">
          <TikTokIcon className="w-5 h-5" />
        </a>
        <a href="https://www.instagram.com/amloubliss" target="_blank" rel="noopener noreferrer" className="w-12 h-12 rounded-full border border-gray-100 shadow-sm flex items-center justify-center text-gray-600 hover:text-[#ff8a00] hover:border-[#ff8a00] hover:shadow-md hover:scale-110 transition-all bg-white">
          <Instagram className="w-5 h-5" />
        </a>
        <a href="https://www.facebook.com/profile.php?id=61560329213924" target="_blank" rel="noopener noreferrer" className="w-12 h-12 rounded-full border border-gray-100 shadow-sm flex items-center justify-center text-gray-600 hover:text-[#ff8a00] hover:border-[#ff8a00] hover:shadow-md hover:scale-110 transition-all bg-white">
          <Facebook className="w-5 h-5" />
        </a>
        <a href="https://wa.me/212754377585" target="_blank" rel="noopener noreferrer" className="w-12 h-12 rounded-full border border-gray-100 shadow-sm flex items-center justify-center text-gray-600 hover:text-[#ff8a00] hover:border-[#ff8a00] hover:shadow-md hover:scale-110 transition-all bg-white">
          <MessageCircle className="w-5 h-5" />
        </a>
        <a href="mailto:amloubliss@proton.me" className="w-12 h-12 rounded-full border border-gray-100 shadow-sm flex items-center justify-center text-gray-600 hover:text-[#ff8a00] hover:border-[#ff8a00] hover:shadow-md hover:scale-110 transition-all bg-white">
          <Mail className="w-5 h-5" />
        </a>
      </div>

      <motion.button 
        whileTap={{ scale: 0.95 }}
        onClick={onOpenRecipes}
        className="bg-[#ff8a00] hover:bg-[#e67a00] w-full max-w-sm md:max-w-md text-white font-bold text-xl py-6 rounded-full tracking-widest shadow-[0_10px_30px_rgba(255,138,0,0.3)] hover:shadow-[0_15px_40px_rgba(255,138,0,0.4)] transition-all mb-20"
      >
        CHECK OUR RECIPES
      </motion.button>

      <div className="w-full flex flex-col md:flex-row items-center justify-center gap-4 md:gap-8 text-sm text-gray-400 max-w-4xl px-6 font-sans">
        <a href="#" className="hover:text-gray-800 transition-colors">Privacy Policy</a>
        <span className="hidden md:inline text-gray-300">|</span>
        <a href="#" className="hover:text-gray-800 transition-colors">Terms of Service</a>
        <span className="hidden md:inline text-gray-300">|</span>
        <a href="#" className="hover:text-gray-800 transition-colors">Refund Policy</a>
      </div>
    </motion.footer>
  );
}

function RecipeHero({ onOpenRecipes }: any) {
  const { t, isRTL } = useTranslation();
  const ref = React.useRef(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"]
  });
  const y = useTransform(scrollYProgress, [0, 1], ["-10%", "10%"]);

  return (
    <section id="recipes" ref={ref} className="w-full max-w-7xl mx-auto px-4 pb-24 z-30 relative bg-[#F5F5F1]">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: false }}
        transition={{ duration: 1.2, ease: [0.33, 1, 0.68, 1] }}
        className="relative w-full aspect-[4/3] md:aspect-[21/9] rounded-[2rem] md:rounded-[3rem] overflow-hidden group cursor-pointer" 
        onClick={onOpenRecipes}
      >
        <motion.img 
          style={{ y, scale: 1.2 }}
          src="https://images.unsplash.com/photo-1496412705862-e0088f16f791?auto=format&fit=crop&q=80&w=2000" 
          className="absolute inset-0 w-full h-full object-cover" 
          alt="Amlou Recipes" 
        />
        <div className="absolute inset-0 bg-black/40 transition-colors duration-500 group-hover:bg-black/50"></div>
        
        <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center">
          <RevealText text={t('recHero1')} className="font-serif text-4xl md:text-6xl text-white mb-4 lowercase drop-shadow-lg" />
          <RevealText text={t('recHero2')} delay={0.3} fast={true} className="font-sans text-white/90 text-lg md:text-xl max-w-lg mb-8 drop-shadow-md" />
          
          <motion.button 
            whileTap={{ scale: 0.95 }}
            className="bg-[#ff8a00] hover:bg-[#ff9900] hover:scale-[1.03] transition-all duration-300 text-black font-medium text-lg py-4 px-10 rounded-full flex items-center justify-center gap-3 shadow-[0_0_40px_rgba(255,138,0,0.25)] hover:shadow-[0_0_60px_rgba(255,138,0,0.4)]"
            onClick={(e: any) => { e.stopPropagation(); onOpenRecipes(); }}
          >
            <span>{t('recBtn')}</span>
            <ArrowRight className={`w-5 h-5 ${isRTL ? 'rotate-180' : ''}`} />
          </motion.button>
        </div>
      </motion.div>
    </section>
  );
}

function RecipeListModal({ isOpen, onClose, onSelectRecipe }: any) {
  const { t } = useTranslation();
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div 
          initial={{ y: '100%' }} 
          animate={{ y: 0 }} 
          exit={{ y: '100%' }} 
          transition={{ duration: 0.6, ease: [0.33, 1, 0.68, 1] }} 
          className="fixed inset-0 bg-[#F5F5F1] z-[120] flex flex-col overflow-y-auto w-full"
        >
          <button onClick={onClose} className="fixed top-6 right-6 md:top-8 md:right-8 z-[130] bg-white/80 backdrop-blur-md shadow-sm hover:bg-gray-100 p-3 rounded-full transition-colors">
            <X className="w-6 h-6 text-black"/>
          </button>
          
        <div className="pt-32 px-6 md:px-12 w-full max-w-7xl mx-auto flex flex-col pb-24">
            <RevealText text={t('recList')} className="font-serif text-5xl md:text-7xl mb-12 text-black !justify-start" once={true} />
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-12">
              {RECIPES.map((recipe, i) => (
                <motion.div
                  key={recipe.id}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 + 0.4 }}
                  className="group cursor-pointer flex flex-col bg-white rounded-[2rem] p-6 shadow-md hover:shadow-2xl transition-all border border-gray-200"
                  onClick={() => onSelectRecipe(recipe)}
                >
                  <div className="w-full aspect-[4/5] bg-gray-100 rounded-[1.5rem] mb-6 overflow-hidden relative">
                     <img src={recipe.img} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" alt={t(recipe.title_key)} />
                  </div>
                  <h3 className="font-bold text-2xl mb-2 px-1 group-hover:text-[#ff8a00] transition-colors">{t(recipe.title_key)}</h3>
                  <p className="text-gray-500 font-sans leading-relaxed px-1">{t(recipe.desc_key)}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function RecipeDetailModal({ recipe, onClose }: any) {
  const { t } = useTranslation();
  return (
        <motion.div 
          key="recipe-detail"
          initial={{ opacity: 0 }} 
          animate={{ opacity: 1 }} 
          exit={{ opacity: 0, transition: { duration: 0.4 } }} 
          transition={{ duration: 0.4 }} 
          className="fixed inset-0 bg-white z-[140] flex flex-col md:flex-row h-[100dvh] overflow-hidden"
        >
          <button onClick={onClose} className="absolute top-6 right-6 md:top-8 md:right-8 z-50 bg-white/50 backdrop-blur-md p-3 rounded-full hover:bg-white transition-colors shadow-sm">
            <X className="w-6 h-6 text-black"/>
          </button>
          
          <motion.div 
            initial={{ x: -100, opacity: 0 }} 
            animate={{ x: 0, opacity: 1 }} 
            exit={{ x: -100, opacity: 0 }}
            transition={{ delay: 0.1, duration: 0.5, ease: "easeOut" }} 
            className="w-full md:w-1/2 h-[40vh] md:h-full relative"
          >
            <img src={recipe.img} alt={t(recipe.title_key)} className="w-full h-full object-cover" />
          </motion.div>
          
          <motion.div 
            initial={{ x: 100, opacity: 0 }} 
            animate={{ x: 0, opacity: 1 }} 
            exit={{ x: 100, opacity: 0 }}
            transition={{ delay: 0.2, duration: 0.5, ease: "easeOut" }} 
            className="w-full md:w-1/2 h-[60vh] md:h-full p-8 md:p-16 lg:p-24 overflow-y-auto bg-[#F5F5F1] flex flex-col"
          >
             <h2 className="font-serif text-4xl md:text-6xl text-black mb-6 leading-tight">{t(recipe.title_key)}</h2>
             <p className="text-lg md:text-xl text-gray-600 font-light mb-12">{t(recipe.desc_key)}</p>
             
             <div className="mb-12">
               <h4 className="font-bold text-sm tracking-widest uppercase text-gray-400 mb-6 flex items-center gap-3">
                 <span className="w-8 h-[1px] bg-[#ff8a00]"></span> {t('ingredientsLabel')}
               </h4>
               <ul className="space-y-4">
                 {t(`${recipe.id}_ing`).split('|').map((ing: string, i: number) => (
                   <li key={i} className="text-lg text-black border-b border-gray-200/60 pb-3 flex items-start gap-3">
                     <span className="text-[#ff8a00] font-bold">•</span> {ing}
                   </li>
                 ))}
               </ul>
             </div>

             <div className="pb-24">
               <h4 className="font-bold text-sm tracking-widest uppercase text-gray-400 mb-6 flex items-center gap-3">
                 <span className="w-8 h-[1px] bg-[#ff8a00]"></span> {t('instructionsLabel')}
               </h4>
               <div className="space-y-8">
                 {t(`${recipe.id}_inst`).split('|').map((inst: string, i: number) => (
                   <div key={i} className="flex gap-6 items-start">
                      <span className="font-serif text-[#ff8a00] text-3xl md:text-4xl italic opacity-50 block w-8 pt-1">0{i+1}</span>
                      <p className="text-lg text-black leading-relaxed flex-1">{inst}</p>
                   </div>
                 ))}
               </div>
             </div>
          </motion.div>
        </motion.div>
  );
}
