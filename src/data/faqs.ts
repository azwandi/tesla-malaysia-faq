export interface FAQ {
  id: string;
  slug: string;
  question: string;
  answer: string;
  tags: string[];
  affectedModels: string[];
  competitorInfo?: {
    title: string;
    content: string;
  };
}

export const faqs: FAQ[] = [
  {
    id: "1",
    slug: "charging-cost-malaysia",
    question: "How much does it cost to charge a Tesla in Malaysia?",
    answer: "Charging costs in Malaysia vary by method: Home charging (AC) costs approximately RM0.36-0.57 per kWh depending on your TNB tariff, making it about RM15-25 for a full charge. Tesla Superchargers cost around RM1.20-1.50 per kWh, resulting in RM60-80 for a full charge. Public DC fast chargers range from RM0.80-1.20 per kWh. For daily driving (50km), home charging costs about RM3-5 per day, compared to RM15-20 for petrol in a conventional car.",
    tags: ["charging", "costs", "electricity", "savings"],
    affectedModels: ["Model 3", "Model Y", "Model S", "Model X"],
    competitorInfo: {
      title: "vs Petrol Cars",
      content: "Tesla charging costs 60-70% less than petrol. A Camry uses ~RM20/day for 50km, while Model 3 uses ~RM4/day."
    }
  },
  {
    id: "2",
    slug: "government-incentives-malaysia",
    question: "What government incentives are available for Tesla buyers in Malaysia?",
    answer: "Tesla buyers in Malaysia enjoy significant government incentives: Complete exemption from import duty and excise duty until December 2025, saving approximately RM30,000-50,000 per vehicle. Sales tax exemption of 10%. Road tax reduction of up to 80% for electric vehicles. Income tax relief up to RM2,500 for EV charging equipment installation. Additionally, some states offer additional incentives like free parking and toll discounts.",
    tags: ["incentives", "government", "tax", "savings", "policy"],
    affectedModels: ["Model 3", "Model Y"],
    competitorInfo: {
      title: "vs Luxury ICE Cars",
      content: "Without incentives, Tesla would cost RM50,000+ more. BMW 330i or Mercedes C200 don't qualify for these savings."
    }
  },
  {
    id: "3",
    slug: "maintenance-cost-comparison",
    question: "How does Tesla maintenance cost compare to BMW/Mercedes in Malaysia?",
    answer: "Tesla maintenance costs are significantly lower than German luxury cars in Malaysia. Tesla requires minimal scheduled maintenance - mainly tire rotation, cabin filter replacement, and brake fluid checks every 2-4 years. Annual costs typically range RM500-1,000. BMW/Mercedes require more frequent servicing every 10,000km with costs of RM800-1,500 per service. Over 5 years, Tesla maintenance costs ~RM3,000-5,000 vs BMW/Mercedes ~RM8,000-15,000. Tesla's regenerative braking means brake pads last much longer, and there's no engine oil, transmission fluid, or spark plugs to replace.",
    tags: ["maintenance", "costs", "comparison", "BMW", "Mercedes", "service"],
    affectedModels: ["Model 3", "Model Y", "Model S"],
    competitorInfo: {
      title: "vs German Luxury Cars",
      content: "5-year maintenance: Tesla RM3,000-5,000 vs BMW 3-Series RM8,000-12,000 vs Mercedes C-Class RM10,000-15,000"
    }
  },
  {
    id: "4",
    slug: "autopilot-legal-safe-malaysia",
    question: "Is Tesla Autopilot legal and safe to use in Malaysia?",
    answer: "Tesla Autopilot is legal in Malaysia but requires driver attention at all times. The base Autopilot (Traffic-Aware Cruise Control and Autosteer) is included with all Teslas and can be safely used on highways and well-marked roads. Enhanced Autopilot and Full Self-Driving features have limited functionality in Malaysia due to local regulations and mapping data. Drivers must keep hands on the wheel and remain alert. Tesla's safety data shows Autopilot reduces accidents by up to 40% when used properly. However, Malaysian traffic conditions, inconsistent road markings, and motorbike behavior require extra caution.",
    tags: ["autopilot", "safety", "legal", "FSD", "driving"],
    affectedModels: ["Model 3", "Model Y", "Model S", "Model X"],
    competitorInfo: {
      title: "vs Other Driver Assists",
      content: "More advanced than BMW Driving Assistant or Mercedes DISTRONIC but requires more driver attention than in US/Europe."
    }
  },
  {
    id: "5",
    slug: "tesla-resale-value-malaysia",
    question: "What's the resale value of Tesla vehicles in Malaysia?",
    answer: "Tesla vehicles in Malaysia maintain strong resale value, typically retaining 65-75% of their value after 3 years, compared to 50-60% for luxury German cars. Factors supporting resale value include: limited supply in Malaysian market, strong brand recognition, lower running costs attracting used car buyers, and regular over-the-air updates that keep older models current. Model 3 and Model Y have shown particularly strong resale performance. However, battery degradation (typically 5-10% after 5 years) and rapid technology advancement can affect older models. The growing charging infrastructure and government EV push further support long-term value retention.",
    tags: ["resale", "value", "investment", "depreciation", "market"],
    affectedModels: ["Model 3", "Model Y", "Model S"],
    competitorInfo: {
      title: "vs Luxury ICE Cars",
      content: "3-year resale: Tesla 65-75% vs BMW 50-60% vs Mercedes 45-55% vs Audi 50-60%"
    }
  },
  {
    id: "6",
    slug: "model-3-vs-model-y-malaysia",
    question: "Should I buy Model 3 or Model Y in Malaysia?",
    answer: "Choice between Model 3 and Model Y depends on your needs: Model 3 is more affordable (starting ~RM189k vs ~RM199k), offers better efficiency and range, has sportier handling, and lower running costs. Model Y provides higher seating position, more cargo space (especially with rear seats folded), easier entry/exit, better visibility in Malaysian traffic, and more practical for families. For Malaysian conditions: Model Y's higher ground clearance helps with parking ramps and speed bumps, better for carrying passengers/cargo, preferred by families. Model 3 is better for daily commuting, more efficient for long-distance travel, and appeals to driving enthusiasts. Both have identical technology and safety features.",
    tags: ["Model 3", "Model Y", "comparison", "choice", "family"],
    affectedModels: ["Model 3", "Model Y"],
    competitorInfo: {
      title: "vs Segment Competitors",
      content: "Model 3 competes with BMW 3-Series, Mercedes C-Class. Model Y competes with BMW X3, Mercedes GLC, but offers more space and tech."
    }
  },
  {
    id: "7",
    slug: "charging-infrastructure-malaysia",
    question: "How reliable is the charging infrastructure for Tesla in Malaysia?",
    answer: "Malaysia's charging infrastructure is rapidly expanding but requires planning for long trips. Tesla Superchargers are available in major cities (KL, Selangor, Penang, JB) with 99%+ uptime reliability. Third-party DC fast chargers (ChargEV, Shell Recharge, etc.) cover most highways and shopping malls but can be less reliable (85-90% uptime). For daily use, home charging covers 90% of needs. For interstate travel, plan charging stops every 200-250km. Avoid relying solely on destination charging at hotels/malls as availability isn't guaranteed. The government plans 10,000 charging points by 2025, significantly improving coverage. Apps like PlugShare and ChargEV help locate working chargers.",
    tags: ["charging", "infrastructure", "reliability", "supercharger", "travel"],
    affectedModels: ["Model 3", "Model Y", "Model S", "Model X"]
  },
  {
    id: "8",
    slug: "tesla-warranty-service-malaysia",
    question: "What warranty and service support does Tesla provide in Malaysia?",
    answer: "Tesla Malaysia provides comprehensive warranty coverage: Basic vehicle warranty for 4 years/80,000km, battery and drive unit warranty for 8 years/160,000km (Model 3/Y) with guaranteed 70% capacity retention. Service is handled through Tesla Service Centers in Cyberjaya and authorized mobile service. Mobile service covers 80% of issues at your location. Parts availability is generally good for common items, though some specialized parts may take 1-2 weeks. Over-the-air updates fix many issues remotely. Tesla's warranty is more comprehensive than traditional luxury cars, covering software and hardware. Service costs are transparent with upfront pricing, and most service appointments can be booked through the Tesla app.",
    tags: ["warranty", "service", "support", "mobile service", "coverage"],
    affectedModels: ["Model 3", "Model Y", "Model S", "Model X"]
  }
];

export function searchFAQs(query: string): FAQ[] {
  if (!query.trim()) return faqs;
  
  const searchTerm = query.toLowerCase().trim();
  
  return faqs.filter(faq => 
    faq.question.toLowerCase().includes(searchTerm) ||
    faq.answer.toLowerCase().includes(searchTerm) ||
    faq.tags.some(tag => tag.toLowerCase().includes(searchTerm)) ||
    faq.affectedModels.some(model => model.toLowerCase().includes(searchTerm))
  );
}

export function getFAQBySlug(slug: string): FAQ | undefined {
  return faqs.find(faq => faq.slug === slug);
}

export const popularSearchTerms = [
  "charging cost",
  "government incentives", 
  "Model 3 vs Model Y",
  "maintenance cost",
  "Autopilot safety",
  "resale value",
  "charging infrastructure",
  "warranty"
];