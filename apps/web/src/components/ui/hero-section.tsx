import { SearchBar } from './search-bar';

export function HeroSection() {
  return (
    <div className="relative h-[500px] bg-cover bg-center rounded-3xl overflow-hidden"
      style={{ backgroundImage: "url('https://images.unsplash.com/photo-1566073771259-6a8506099945?w=1600')" }}>
      <div className="absolute inset-0 bg-gradient-to-r from-[#1E3A5F]/80 to-transparent" />
      <div className="relative z-10 h-full flex flex-col justify-center items-center text-white px-8">
        <h1 className="text-5xl font-bold mb-2">Find Your Perfect Stay</h1>
        <p className="text-xl mb-8 text-white/90">Book hotels, resorts, and apartments worldwide</p>
        <SearchBar className="w-full max-w-4xl" />
      </div>
    </div>
  );
}