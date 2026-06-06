# Holo Shield AI - Scam Detection Platform

A comprehensive scam detection and protection platform designed specifically for international students in Australia, with features for everyone who wants to stay safe online.

## 🚀 Features

### 1. **AI-Powered Scam Scanner**
- Real-time risk analysis with visual risk meter (Low/Medium/High)
- Analyzes URLs, emails, phone numbers, and text messages
- Detects phishing patterns, urgency tactics, and suspicious indicators
- Provides clear, actionable explanations

### 2. **Community Reporting System**
- Submit and browse scam reports by category:
  - Phishing emails
  - Fake websites
  - Scam calls
  - Fake social media accounts
  - Rental scams
  - Job scams
- Filter reports by category
- Community voting system

### 3. **Recovery Help ("What Do I Do Now?")**
Step-by-step recovery guidance for different scenarios:
- **Made a Payment**: Bank contact info, chargeback steps, reporting
- **Shared Personal Info**: Password changes, identity theft monitoring
- **Clicked a Link**: Malware scanning, account security
- **Account Compromised**: Account recovery, contact alerts

### 4. **Evidence Vault**
- Store and organize scam evidence:
  - Screenshots
  - Email copies
  - Text messages
  - Call logs
  - Payment receipts
- Build comprehensive reports for authorities
- Timestamped records

### 5. **Community Chat**
- Real-time discussion with AI assistant
- Ask questions about suspicious content
- Share experiences with other users
- Get instant advice

### 6. **International Student Support (Australia-Specific)**
- Common scams targeting students in Australia
- Local reporting contacts:
  - Scamwatch
  - ReportCyber
  - Police hotlines
  - ACCC
- Bank fraud hotlines for major Australian banks
- University support resources
- Rental, job, and visa scam information

## 🛠️ Technology Stack

- **Frontend**: HTML5, CSS3, Vanilla JavaScript
- **Database**: IndexedDB (browser-based, no server required)
- **Design**: Modern glassmorphism UI with dark theme
- **Responsive**: Mobile-first design

## 📁 File Structure

```
├── index.html          # Landing page (main entry point)
├── Login.html          # Login page
├── dashboard.html      # Main application dashboard
├── Holo.css           # Shared styles
├── dashboard.css      # Dashboard-specific styles
├── dashboard.js       # Application logic and IndexedDB
└── README.md          # This file
```

## 🚦 Getting Started

1. Open `index.html` in a modern web browser
2. Click "Try Dashboard" or "Login" to access the application
3. No installation or server setup required!

## 💡 Key Features Explained

### Risk Meter
The risk meter provides a visual representation of threat level:
- **Low Risk (0-29)**: Generally safe, but stay cautious
- **Medium Risk (30-59)**: Suspicious characteristics detected
- **High Risk (60-100)**: Multiple red flags, likely a scam

### Analysis Indicators
The scanner checks for:
- Shortened URLs (bit.ly, tinyurl)
- Non-HTTPS connections
- IP addresses instead of domains
- Phishing keywords (paypal, bank, verify, urgent)
- Urgency pressure tactics
- Prize/lottery language
- Suspicious call-to-action phrases

### Recovery Steps
Immediate actions organized by priority:
1. **Stop the threat** (contact bank, disconnect internet)
2. **Document everything** (screenshots, receipts, times)
3. **Report officially** (police, Scamwatch, banks)
4. **Secure accounts** (passwords, 2FA, monitoring)

## 🇦🇺 Australia-Specific Resources

### Reporting Contacts
- **Scamwatch**: scamwatch.gov.au
- **ReportCyber**: cyber.gov.au
- **Police**: 000 (emergency) or 131 444
- **ACCC**: 1300 302 502
- **IDCARE**: 1800 595 160

### Bank Fraud Hotlines
- Commonwealth Bank: 13 2221
- Westpac: 132 032
- ANZ: 13 33 50
- NAB: 13 22 65

## 🎯 Target Audience

### Primary
- International students in Australia
- New arrivals unfamiliar with local scams
- People seeking plain-English explanations

### Secondary
- Small businesses
- Support teams
- Student associations
- Anyone concerned about online safety

## 🔒 Privacy & Security

- All data stored locally in your browser (IndexedDB)
- No server uploads or external data sharing
- No account required for basic features
- Clear data anytime by clearing browser storage

## 🌟 Future Enhancements

- [ ] Human review service for complex cases
- [ ] Multi-language support
- [ ] Browser extension
- [ ] Mobile app
- [ ] Integration with university systems
- [ ] Premium features (unlimited scans, priority support)
- [ ] Export evidence reports as PDF
- [ ] Real-time scam alerts

## 📱 Browser Compatibility

- Chrome/Edge: ✅ Full support
- Firefox: ✅ Full support
- Safari: ✅ Full support
- Opera: ✅ Full support

Requires modern browser with IndexedDB support.

## 🤝 Contributing

This is a demonstration project. For production use:
1. Implement proper authentication
2. Add server-side validation
3. Integrate real threat intelligence APIs
4. Add proper OAuth for social login
5. Implement rate limiting
6. Add comprehensive error handling

## 📄 License

Educational/demonstration project. Adapt as needed for your use case.

## 📧 Contact

For support or inquiries: tranbaphuchung2005@gmail.com

---

**Built with care for international students and anyone who wants to stay safe online.** 🛡️
