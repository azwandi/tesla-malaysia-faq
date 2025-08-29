const stats = [
  {
    number: "500+",
    label: "FAQ Articles",
    description: "Comprehensive answers to all your Tesla questions"
  },
  {
    number: "50+", 
    label: "Categories",
    description: "Organized topics covering every aspect of Tesla ownership"
  },
  {
    number: "10k+",
    label: "Happy Users", 
    description: "Tesla owners who found the answers they needed"
  },
  {
    number: "24/7",
    label: "Available",
    description: "Access information anytime, anywhere you need it"
  }
];

export const StatsSection = () => {
  return (
    <section className="py-16 bg-primary text-primary-foreground">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map((stat, index) => (
            <div key={index} className="text-center">
              <div className="text-4xl md:text-5xl font-bold mb-2">
                {stat.number}
              </div>
              <div className="text-xl font-semibold mb-1 text-primary-foreground/90">
                {stat.label}
              </div>
              <div className="text-sm text-primary-foreground/70 hidden md:block">
                {stat.description}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};