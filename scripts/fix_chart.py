import re

# Read the file
with open('src/components/Analytics/TrendAnalysis.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# Find the demographic chart section and remove the conditional visibleLines checks
# Also remove all biometric and enrollment lines

# Pattern to match the conditional rendering blocks we want to remove
pattern = r'\{visibleLines\.demo_5_17 &&[^}]+}\)\}'
content = re.sub(pattern, '''<Line 
                                type="monotone" 
                                dataKey="demo_5_17" 
                                stroke="#3b82f6" 
                                name="Demo 5-17"
                                strokeWidth={2}
                                dot={false}
                            />''', content, count=1)

pattern = r'\{visibleLines\.demo_17_plus &&[^}]+}\)\}'
content = re.sub(pattern, '''<Line 
                                type="monotone" 
                                dataKey="demo_17_plus" 
                                stroke="#60a5fa" 
                                name="Demo 17+"
                                strokeWidth={2}
                                dot={false}
                            />''', content, count=1)

# Remove all the biometric, enrollment, and total lines from the first chart  
# Match from "Biometric Lines" comment to the end of "Total Line" section
pattern = r'\/\* Biometric Lines \*\/.*?}\)\s*\n\s*}\)' 
content = re.sub(pattern, '''<Line 
                                type="monotone" 
                                dataKey="demographic_activity" 
                                stroke="#8b5cf6" 
                                name="Total Demographic"
                                strokeWidth={3}
                                dot={false}
                            />''', content, flags=re.DOTALL, count=1)

# Write back
with open('src/components/Analytics/TrendAnalysis.tsx', 'w', encoding='utf-8') as f:
    f.write(content)

print("File updated successfully")
