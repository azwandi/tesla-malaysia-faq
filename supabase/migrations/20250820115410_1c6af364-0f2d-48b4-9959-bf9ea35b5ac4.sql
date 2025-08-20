-- Create FAQs table for admin management
CREATE TABLE public.faqs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  slug TEXT NOT NULL UNIQUE,
  question TEXT NOT NULL,
  answer TEXT NOT NULL,
  tags TEXT[] DEFAULT '{}',
  affected_models TEXT[] DEFAULT '{}',
  competitor_info JSONB,
  is_published BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.faqs ENABLE ROW LEVEL SECURITY;

-- Create policies for public read access
CREATE POLICY "FAQs are viewable by everyone" 
ON public.faqs 
FOR SELECT 
USING (is_published = true);

-- Create policies for admin access (only authenticated users can modify)
CREATE POLICY "Authenticated users can insert FAQs" 
ON public.faqs 
FOR INSERT 
TO authenticated 
WITH CHECK (true);

CREATE POLICY "Authenticated users can update FAQs" 
ON public.faqs 
FOR UPDATE 
TO authenticated 
USING (true);

CREATE POLICY "Authenticated users can delete FAQs" 
ON public.faqs 
FOR DELETE 
TO authenticated 
USING (true);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_faqs_updated_at
BEFORE UPDATE ON public.faqs
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert existing FAQ data
INSERT INTO public.faqs (slug, question, answer, tags, affected_models, competitor_info) VALUES
(
  'charging-cost-malaysia',
  'How much does it cost to charge a Tesla in Malaysia?',
  'Charging costs in Malaysia vary significantly based on your charging method:

**Home Charging (Most Economical)**
- Using TNB residential tariff: ~RM 0.218 per kWh
- Model 3 (75 kWh battery): ~RM 16.35 for full charge (0-100%)
- Model Y (82 kWh battery): ~RM 17.88 for full charge (0-100%)
- Daily driving (50km): ~RM 3-5 per day

**Public AC Charging**
- ChargEV network: RM 0.50-0.80 per kWh
- JomCharge: RM 0.60-1.00 per kWh
- Full charge cost: RM 37.50-82 depending on provider

**Tesla Supercharger Network**
- Currently limited locations in Malaysia
- Peak hours: ~RM 1.20 per kWh
- Off-peak: ~RM 0.80 per kWh
- Model 3 full charge: ~RM 60-90

**Monthly Cost Comparison**
- Tesla (1,500km/month): RM 150-250
- Petrol car (1,500km/month): RM 350-500
- **Savings: Up to 50% on fuel costs**

*Note: Home charging offers the best value, while public charging is convenient for long trips.*',
  ARRAY['charging', 'cost', 'savings', 'tnb', 'electricity'],
  ARRAY['Model 3', 'Model Y', 'Model S', 'Model X'],
  '{"comparison": "50% cheaper than petrol cars for same distance", "annual_savings": "RM 2400-3000 compared to premium petrol vehicles"}'::jsonb
),
(
  'government-incentives-malaysia',
  'What government incentives are available for Tesla buyers in Malaysia?',
  'Malaysia offers several attractive incentives for Tesla and EV buyers:

**Import Duty & Tax Exemptions**
- **100% import duty exemption** for CBU EVs until Dec 2025
- **100% excise duty exemption** for EVs
- Road tax as low as **RM 20 per year** for EVs
- No luxury tax on Tesla vehicles

**EV Policy Benefits**
- Sales tax exemption for locally assembled EVs
- Tax deductions for EV charging infrastructure installation
- Government commitment to expand charging network

**Tesla-Specific Savings**
- Model 3: Save ~RM 30,000-50,000 in taxes
- Model Y: Save ~RM 40,000-70,000 in taxes
- Model S/X: Save ~RM 80,000-120,000 in taxes

**Additional Benefits**
- HOV lane access in certain areas
- Preferential parking rates at some malls
- Corporate tax incentives for businesses buying EVs

**Future Incentives (Rumored)**
- Cash rebates for trade-ins of ICE vehicles
- Additional tax deductions for home charging installations
- Possible extension of duty exemptions beyond 2025

**Important**: These incentives make Tesla pricing extremely competitive compared to equivalent luxury German vehicles. A Model 3 costs similar to a BMW 320i after incentives, but with significantly lower running costs.

*Always consult with Tesla Malaysia for the latest incentive information as policies may change.*',
  ARRAY['incentives', 'government', 'tax', 'savings', 'policy'],
  ARRAY['Model 3', 'Model Y', 'Model S', 'Model X'],
  '{"vs_bmw": "Model 3 price similar to BMW 320i after incentives", "vs_mercedes": "Model Y price competitive with GLC 200 after incentives"}'::jsonb
),
(
  'maintenance-cost-comparison',
  'How does Tesla maintenance cost compare to BMW or Mercedes in Malaysia?',
  'Tesla maintenance costs are significantly lower than traditional luxury vehicles:

**Tesla Annual Maintenance**
- **No engine oil changes** (saves RM 800-1,200/year)
- **No transmission servicing** (saves RM 1,500-2,000/year)
- **Regenerative braking** = less brake pad replacement
- Basic service: RM 800-1,200 annually
- **Total: ~RM 2,000-3,000/year**

**BMW 3 Series Annual Maintenance**
- Engine oil + filter: RM 800-1,200
- Transmission service: RM 1,500-2,000
- Brake pads/discs: RM 2,000-3,000 (every 2-3 years)
- Air filter, spark plugs, etc.: RM 1,000-1,500
- **Total: ~RM 8,000-12,000/year**

**Mercedes C-Class Annual Maintenance**
- Similar to BMW: RM 8,000-15,000/year
- Higher parts costs due to brand premium
- More frequent servicing requirements

**Tesla Advantages**
- **Fewer moving parts** = less wear and tear
- **Over-the-air updates** fix many issues remotely
- **8-year battery warranty** with unlimited mileage
- Mobile service available for minor repairs

**Potential Tesla Costs**
- Tire replacement: RM 2,000-4,000 (every 40,000-60,000km)
- 12V battery: RM 500-800 (every 4-6 years)
- Air filter: RM 200-400 (every 2 years)

**5-Year Ownership Cost Comparison**
- Tesla: RM 15,000-20,000
- BMW: RM 40,000-60,000
- Mercedes: RM 45,000-75,000

**Savings: Up to RM 40,000-50,000 over 5 years compared to German luxury cars.**',
  ARRAY['maintenance', 'cost', 'comparison', 'bmw', 'mercedes', 'savings'],
  ARRAY['Model 3', 'Model Y'],
  '{"bmw_320i": "Tesla saves RM 8,000-10,000 annually vs BMW 320i", "mercedes_c200": "Tesla saves RM 10,000-12,000 annually vs Mercedes C200", "audi_a4": "Tesla saves RM 9,000-11,000 annually vs Audi A4"}'::jsonb
),
(
  'autopilot-safety-malaysia',
  'Is Tesla Autopilot legal and safe to use in Malaysia?',
  'Tesla Autopilot is legal in Malaysia with important considerations:

**Legal Status**
- **Fully legal** under Malaysian road transport regulations
- Classified as Level 2 autonomous driving assistance
- Driver must remain alert and hands on wheel
- **Driver remains fully responsible** for vehicle control

**Safety Features in Malaysia**
- **Traffic-Aware Cruise Control**: Maintains safe following distance
- **Autosteer**: Keeps vehicle in lane on highways
- **Navigate on Autopilot**: Suggests lane changes and exits
- **Smart Summon**: Move car in parking lots (low speed)

**Malaysian Road Conditions**
- **Best performance**: PLUS highways (North-South Expressway)
- **Good performance**: Major highways like LDP, NKVE, MRR2
- **Limited performance**: City streets with poor lane markings
- **Challenges**: Construction zones, inconsistent signage

**Safety Statistics**
- Tesla vehicles with Autopilot engaged have **10x lower accident rates**
- Autopilot performs well in Malaysian highway conditions
- Regular over-the-air updates improve performance

**Usage Recommendations**
- **Use on highways**: Ideal for long-distance highway driving
- **Stay alert**: Always keep hands on wheel and eyes on road
- **Be ready to take over**: Especially in construction zones
- **Avoid in heavy rain**: Reduced camera effectiveness

**Local Considerations**
- Malaysian driving habits (sudden lane changes)
- Motorcycles filtering between lanes
- Inconsistent road markings in some areas
- Construction zones common on highways

**Enhanced Autopilot Features**
- Auto Lane Change
- Auto Park
- Summon
- Navigate on Autopilot

**Important**: Autopilot is a driver assistance system, not fully autonomous driving. Always remain attentive and ready to take control.',
  ARRAY['autopilot', 'safety', 'legal', 'autonomous', 'driving'],
  ARRAY['Model 3', 'Model Y', 'Model S', 'Model X'],
  '{"vs_mercedes": "More advanced than Mercedes Driver Assistance Package", "vs_bmw": "Superior to BMW Driving Assistant Professional"}'::jsonb
),
(
  'resale-value-malaysia',
  'What is the resale value of Tesla vehicles in Malaysia?',
  'Tesla vehicles maintain strong resale value in Malaysia''s emerging EV market:

**Current Resale Performance**
- **2-3 years old**: 70-80% of original price
- **4-5 years old**: 60-70% of original price
- **Model 3**: Strongest demand in used market
- **Model Y**: Limited used inventory, holding value well

**Factors Supporting Strong Resale**
- **High demand**: Growing EV adoption in Malaysia
- **Limited supply**: Tesla''s selective delivery schedule
- **Government incentives**: Make new cars expensive without rebates
- **Charging infrastructure**: Rapidly expanding network
- **Brand prestige**: Tesla seen as premium technology brand

**Market Dynamics**
- **Supply shortage**: More buyers than available used Teslas
- **Corporate buyers**: Companies seeking EVs for ESG goals
- **Early adopter premium**: First-generation Tesla owners upgrading
- **Cross-border demand**: Singapore buyers seeking Malaysian Teslas

**Model-Specific Resale Values**
- **Model 3 Standard Range**: 65-75% after 3 years
- **Model 3 Long Range**: 70-80% after 3 years
- **Model Y**: 75-85% after 3 years (limited data)
- **Model S/X**: 60-70% after 3 years

**Comparison with Luxury ICE Vehicles**
- BMW 3 Series: 50-60% after 3 years
- Mercedes C-Class: 45-55% after 3 years
- Audi A4: 50-60% after 3 years
- **Tesla outperforms by 15-25%**

**Factors Affecting Resale**
- **Battery health**: 90%+ capacity maintains premium
- **Autopilot capability**: Enhanced features add value
- **Service history**: Tesla service center maintenance preferred
- **Accident history**: Clean record essential for top prices

**Future Outlook**
- **Positive**: EV adoption accelerating in Malaysia
- **Risk**: Newer models with better features may impact older models
- **Opportunity**: Regional EV market growth supporting demand

**Selling Tips**
- Maintain detailed service records
- Keep software updated
- Preserve battery health with proper charging habits
- Consider timing around new model launches',
  ARRAY['resale', 'value', 'investment', 'depreciation', 'market'],
  ARRAY['Model 3', 'Model Y', 'Model S', 'Model X'],
  '{"vs_bmw": "15-20% better resale value than BMW 3 Series", "vs_mercedes": "20-25% better resale value than Mercedes C-Class", "market_trend": "EV resale values trending upward in Malaysia"}'::jsonb
),
(
  'model-3-vs-model-y-malaysia',
  'Should I buy Model 3 or Model Y in Malaysia?',
  'Both are excellent choices, but here''s how to decide based on Malaysian conditions:

**Model 3 Advantages**
- **Lower price**: RM 30,000-50,000 cheaper than Model Y
- **Better efficiency**: ~15% more range per kWh
- **Sportier handling**: Lower center of gravity, more engaging drive
- **Easier parking**: Better for tight Malaysian parking spaces
- **Faster acceleration**: Quicker 0-100km/h times

**Model Y Advantages**
- **Higher seating position**: Better visibility in Malaysian traffic
- **More cargo space**: 2,100L vs 425L (seats down)
- **Easier entry/exit**: Important for elderly passengers
- **Better for families**: More rear seat headroom
- **Ground clearance**: Better for Malaysian road conditions
- **Versatility**: SUV practicality with sedan efficiency

**Malaysian-Specific Considerations**

**Parking & City Driving**
- **Model 3**: Easier in Klang Valley parking, shopping malls
- **Model Y**: Higher seating helps with visibility in traffic jams

**Family Needs**
- **Model 3**: Perfect for couples, small families
- **Model Y**: Better for families with children, elderly parents

**Road Conditions**
- **Model 3**: Adequate for most Malaysian roads
- **Model Y**: Extra ground clearance helpful for speed bumps, flooding

**Weather & Practicality**
- **Model 3**: Lower profile, less wind resistance
- **Model Y**: Higher position better for Malaysian monsoon flooding

**Charging Considerations**
- **Model 3**: More efficient, cheaper to charge daily
- **Model Y**: Larger battery, better for long trips to East Coast

**Price Comparison (After Incentives)**
- **Model 3 RWD**: ~RM 189,000
- **Model 3 Long Range**: ~RM 219,000
- **Model Y Long Range**: ~RM 269,000
- **Model Y Performance**: ~RM 319,000

**Recommendation**
- **Choose Model 3 if**: Budget-conscious, mainly city driving, prefer sedan dynamics
- **Choose Model Y if**: Need cargo space, have family, prefer SUV seating position, plan frequent long trips

**Best Value**: Model 3 Long Range offers the sweet spot of features, range, and price for most Malaysian buyers.',
  ARRAY['comparison', 'model-3', 'model-y', 'family', 'practicality'],
  ARRAY['Model 3', 'Model Y'],
  '{"efficiency": "Model 3: 15% more efficient than Model Y", "practicality": "Model Y: 5x more cargo space than Model 3", "price_difference": "Model Y costs RM 50,000-80,000 more than Model 3"}'::jsonb
),
(
  'charging-infrastructure-malaysia',
  'What is the current state of Tesla charging infrastructure in Malaysia?',
  'Malaysia''s Tesla charging infrastructure is rapidly expanding:

**Tesla Supercharger Network**
- **Current locations**: Pavilion KL, Genting Highlands, IOI City Mall
- **Planned expansion**: 20+ locations by end of 2024
- **Charging speed**: Up to 250kW (20-80% in 30 minutes)
- **Coverage**: Focus on Klang Valley, Penang, JB first

**Third-Party DC Fast Charging**
- **ChargEV**: 200+ locations nationwide
- **JomCharge**: 150+ locations, partnership with Shell
- **Gentari**: 50+ locations, expanding rapidly
- **EV Connection**: Growing network in shopping malls

**AC Charging (Home & Destination)**
- **Home installation**: Tesla Wall Connector available
- **Hotels**: Major chains installing Tesla destination chargers
- **Shopping malls**: AC charging widely available
- **Office buildings**: Corporate installations increasing

**Highway Coverage**
- **North-South Highway**: Charging every 100-150km
- **East Coast**: Limited but improving
- **Penang-KL**: Well covered
- **KL-Johor**: Excellent coverage

**Charging Apps & Payment**
- **ChargEV app**: Most comprehensive network
- **JomCharge app**: Convenient Shell integration
- **PlugShare**: Community-driven location finder
- **Tesla app**: Native Supercharger network

**Cost Comparison**
- **Home charging**: RM 0.22/kWh (cheapest)
- **AC public**: RM 0.50-0.80/kWh
- **DC fast charging**: RM 0.80-1.20/kWh
- **Tesla Supercharger**: RM 0.80-1.20/kWh

**Regional Coverage**
- **Klang Valley**: Excellent (50+ locations)
- **Penang**: Good (15+ locations)
- **Johor Bahru**: Good (10+ locations)
- **Kuching**: Limited (5+ locations)
- **Kota Kinabalu**: Basic (3+ locations)

**Future Expansion Plans**
- **2024**: 500+ public charging points
- **2025**: 1,000+ public charging points
- **Government target**: 10,000 charging points by 2030

**Travel Planning**
- **KL to Penang**: Fully supported
- **KL to JB**: Excellent coverage
- **East Coast trips**: Plan charging stops
- **Cross-border**: Singapore connectivity good

**Installation Support**
- Tesla provides home installation service
- Certified electricians available
- Government rebates for home charging equipment
- Strata approval process streamlined for condos

**Reliability**: 95%+ uptime for major networks, with mobile apps showing real-time availability.',
  ARRAY['charging', 'infrastructure', 'supercharger', 'network', 'coverage'],
  ARRAY['Model 3', 'Model Y', 'Model S', 'Model X'],
  '{"coverage": "Malaysia has 400+ public charging points as of 2024", "growth": "Charging infrastructure growing 200% annually", "reliability": "95%+ uptime for major charging networks"}'::jsonb
),
(
  'tesla-service-support-malaysia',
  'What is Tesla service and support like in Malaysia?',
  'Tesla Malaysia provides comprehensive service and support:

**Service Centers**
- **Cyberjaya**: Main service hub with full capabilities
- **Penang**: Northern region service center
- **Mobile Service**: Comes to your location for minor repairs
- **Planned expansion**: JB and East Coast service centers

**Service Capabilities**
- **Full vehicle service**: All repairs and maintenance
- **Body shop**: Accident repair and cosmetic work
- **Parts availability**: 95% of common parts in stock
- **Software updates**: Over-the-air and in-center
- **Diagnostics**: Advanced Tesla-specific equipment

**Mobile Service Program**
- **Coverage**: Klang Valley, Penang, JB
- **Services**: Tire rotation, 12V battery, door handles, minor repairs
- **Convenience**: Service at home or office
- **Cost**: No additional charge for mobile service visits

**Support Channels**
- **Tesla app**: Schedule service, track repairs, communicate
- **Phone support**: Local Malaysian team
- **Online chat**: Real-time assistance
- **Email support**: Non-urgent inquiries

**Warranty Coverage**
- **Vehicle warranty**: 4 years/80,000km
- **Battery warranty**: 8 years/unlimited km (Model S/X), 8 years/192,000km (Model 3/Y)
- **Drive unit warranty**: 8 years/unlimited km
- **Paint warranty**: 4 years/50,000km

**Service Quality**
- **Technician training**: Tesla-certified technicians
- **Genuine parts**: All Tesla OEM parts
- **Loaner vehicles**: Available for extended repairs
- **Customer satisfaction**: 90%+ satisfaction ratings

**Common Service Items**
- **Annual service**: RM 800-1,200
- **Tire rotation**: RM 100-200
- **12V battery replacement**: RM 500-800
- **Brake fluid replacement**: RM 300-500 (every 4 years)

**Appointment Booking**
- **Tesla app**: Preferred method, instant scheduling
- **Online**: Tesla Malaysia website
- **Phone**: Call service center directly
- **Wait times**: Usually 1-2 weeks for routine service

**Emergency Support**
- **24/7 roadside assistance**: Towing, battery jump, tire change
- **Response time**: 1-2 hours in major cities
- **Coverage**: Nationwide roadside assistance
- **Cost**: Included in warranty period

**Parts & Accessories**
- **Genuine Tesla parts**: Available through service centers
- **Accessories**: Wall chargers, floor mats, etc.
- **Performance parts**: Limited availability
- **Third-party options**: Growing aftermarket support

**Customer Experience**
- **Service advisors**: Local Malaysian staff
- **Communication**: Updates via Tesla app
- **Transparency**: Detailed repair estimates
- **Feedback**: Customer surveys after service

**Challenges**
- **Wait times**: Can be longer during peak periods
- **Parts availability**: Some rare parts may need ordering
- **Geographic coverage**: Limited outside major cities

**Improvements Planned**
- Additional service centers in major cities
- Expanded mobile service coverage
- Faster parts supply chain
- Enhanced customer communication tools',
  ARRAY['service', 'support', 'warranty', 'maintenance', 'customer-care'],
  ARRAY['Model 3', 'Model Y', 'Model S', 'Model X'],
  '{"satisfaction": "90%+ customer satisfaction with Tesla service", "coverage": "Mobile service available in 3 major cities", "warranty": "8-year battery warranty with unlimited mileage"}'::jsonb
);