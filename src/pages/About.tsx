import { useStore } from '../store';
import { Shield, Sparkles, Target, Award, Compass, HeartHandshake } from 'lucide-react';

export default function About() {
  const { siteSettings, isDarkMode } = useStore();
  
  const aboutText = siteSettings.aboutUsText || `আমাদের সম্পর্কে About Us – Pixel Market BD
স্বাগতম Pixel Market BD এ।
আমরা শুধু একটি অনলাইন শপ নই — আমরা এমন একটি বিশ্বস্ত প্ল্যাটফর্ম, যেখানে আধুনিক প্রযুক্তি, প্রিমিয়াম কোয়ালিটি এবং গ্রাহকের সন্তুষ্টিকে সর্বোচ্চ গুরুত্ব দেওয়া হয়। বর্তমান ডিজিটাল যুগে মানুষ চায় আসল পণ্য, সঠিক দাম এবং নির্ভরযোগ্য সার্ভিস। আর ঠিক সেই লক্ষ্য নিয়েই যাত্রা শুরু করেছে Pixel Market BD।
আমাদের লক্ষ্য একটাই — বাংলাদেশের প্রতিটি মানুষের কাছে বিশ্বস্ত ও মানসম্মত পণ্য সহজে পৌঁছে দেওয়া।`;

  // Parse sections beautifully
  const lines = aboutText.split('\n');

  return (
    <div className="max-w-4xl mx-auto py-8 md:py-16 animate-in fade-in select-none">
      {/* Decorative Blur Backgrounds */}
      <div className="absolute top-20 left-1/4 w-72 h-72 bg-orange-500/10 dark:bg-orange-500/5 rounded-full blur-[100px] pointer-events-none"></div>
      <div className="absolute bottom-20 right-1/4 w-72 h-72 bg-amber-500/10 dark:bg-amber-500/5 rounded-full blur-[100px] pointer-events-none"></div>

      <div className="text-center mb-12">
        <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-orange-500/10 text-orange-600 dark:text-orange-400 font-extrabold text-[11px] rounded-full uppercase tracking-widest border border-orange-500/20 mb-4 animate-pulse">
          <Sparkles className="w-3.5 h-3.5" />
          Pixel Market BD
        </div>
        <h1 className="text-3xl md:text-5xl font-black text-slate-900 dark:text-white tracking-tight leading-tight">
          আমাদের গল্প ও পরিচিতি
        </h1>
        <p className="text-slate-500 dark:text-slate-400 mt-3.5 text-sm md:text-base max-w-xl mx-auto font-medium">
          আপনার বিশ্বস্ত অনলাইন শপিং পার্টনার। জানুন আমরা কীভাবে আমাদের কাস্টমারদের জন্য সর্বোচ্চ প্রিমিয়াম সেবা নিশ্চিত করি।
        </p>
      </div>

      {/* Main Content Card */}
      <div className="bg-white/80 dark:bg-[#111113]/70 backdrop-blur-md border border-slate-200 dark:border-white/10 rounded-2xl md:rounded-[32px] p-6 md:p-12 shadow-xl shadow-black/5 space-y-8 relative overflow-hidden">
        {/* Subtle glowing borders */}
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-orange-500/40 to-transparent"></div>

        <div className="prose prose-slate dark:prose-invert max-w-none text-slate-705 dark:text-slate-300 leading-relaxed text-sm md:text-base space-y-6">
          {lines.map((line, idx) => {
            const trimmed = line.trim();
            if (!trimmed) return <div key={idx} className="h-2"></div>;

            // Highlight headings
            if (trimmed.endsWith('?') || trimmed.startsWith('আমাদের') || trimmed.startsWith('কেন') || trimmed.startsWith('স্বাগতম') || trimmed.startsWith('গ্রাহকের')) {
              if (trimmed.includes('About Us') || trimmed.startsWith('স্বাগতম')) {
                return (
                  <h2 key={idx} className="text-xl md:text-2xl font-black text-slate-900 dark:text-white mt-4 border-b border-orange-500/10 pb-2 flex items-center gap-2">
                    <Award className="w-5 h-5 text-orange-500" />
                    {trimmed}
                  </h2>
                );
              }
              
              let Icon = Shield;
              if (trimmed.includes('VISION') || trimmed.includes('ভিশন')) Icon = Compass;
              else if (trimmed.includes('MISSION') || trimmed.includes('মিশন')) Icon = Target;
              else if (trimmed.includes('প্রতিশ্রুতি')) Icon = HeartHandshake;

              return (
                <h3 key={idx} className="text-lg md:text-xl font-extrabold text-orange-600 dark:text-orange-400 mt-6 flex items-center gap-2.5">
                  <Icon className="w-5 h-5" />
                  {trimmed}
                </h3>
              );
            }

            // Bullet points
            if (trimmed.startsWith('•') || trimmed.startsWith('-')) {
              return (
                <div key={idx} className="flex items-start gap-2.5 pl-4 py-1">
                  <span className="text-orange-500 font-bold text-lg leading-none mt-0.5">•</span>
                  <span className="font-semibold text-slate-750 dark:text-slate-350">{trimmed.replace(/^[•\-\s]+/, '')}</span>
                </div>
              );
            }

            return (
              <p key={idx} className="text-slate-700 dark:text-slate-350 font-medium whitespace-pre-wrap leading-relaxed">
                {trimmed}
              </p>
            );
          })}
        </div>
      </div>
    </div>
  );
}
