import React, { useState } from 'react';
import './index.css';
import { packages, categoryNames, addons, discountCodes } from './packages.js';
import PerryAssistant from './PerryAssistant';
function App() {
  const [currentStep, setCurrentStep] = useState('welcome');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedPackage, setSelectedPackage] = useState(null);
  const [selectedAddons, setSelectedAddons] = useState([]);
  const [discountCode, setDiscountCode] = useState('');
  const [appliedDiscount, setAppliedDiscount] = useState(null);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [currentMonth, setCurrentMonth] = useState(0);
  
  // Client form states
  const [clientInfo, setClientInfo] = useState({
    name: '',
    email: '',
    phone: '',
    birthday: '',
    paymentName: '',
    preferredCommunication: ''
  });
  const [formErrors, setFormErrors] = useState({});
  const [showTermsPopup, setShowTermsPopup] = useState(false);

  const [bookings, setBookings] = useState([]); // For future admin functionality

  // Admin states
  const [currentView, setCurrentView] = useState('client'); // 'client' or 'admin'
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false);
  const [adminCredentials, setAdminCredentials] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [adminCurrentTab, setAdminCurrentTab] = useState('dashboard');

  // Enhanced admin states
  const [blockedDates, setBlockedDates] = useState([]);
  const [editingPackage, setEditingPackage] = useState(null);
  const [editingDiscount, setEditingDiscount] = useState(null);
  const [showPackageEditor, setShowPackageEditor] = useState(false);
  const [showDiscountEditor, setShowDiscountEditor] = useState(false);
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);
  const [selectedBookingForInvoice, setSelectedBookingForInvoice] = useState(null);

  // At the top of App function, add:
  const [hstSelectedMonth, setHstSelectedMonth] = React.useState(new Date().getMonth());
  const [hstSelectedYear, setHstSelectedYear] = React.useState(new Date().getFullYear());

  // At the top of App function, after other useState hooks:
  const [calendarView, setCalendarView] = useState('year');

  // Additional state for time management
  const [blockedTimeSlots, setBlockedTimeSlots] = useState({});
  const [fakeBookings, setFakeBookings] = useState({});
  const [weekdaysEnabled, setWeekdaysEnabled] = useState(true);

  // Add these new state variables for discount management
  const [discountCodes, setDiscountCodes] = useState([]);
  const [showDiscountForm, setShowDiscountForm] = useState(false);
  const [discountFormData, setDiscountFormData] = useState({
    code: '',
    type: 'percentage', // 'percentage' or 'fixed'
    value: '',
    description: '',
    expiryDate: '',
    usageLimit: '',
    isActive: true
  });

  // --- Package & Category Management State ---
  const [localPackages, setLocalPackages] = useState(() => {
    const saved = localStorage.getItem('peridotPackages');
    return saved ? JSON.parse(saved) : JSON.parse(JSON.stringify(packages));
  });
  const [localCategoryNames, setLocalCategoryNames] = useState(() => {
    const saved = localStorage.getItem('peridotCategoryNames');
    return saved ? JSON.parse(saved) : { ...categoryNames };
  });
  const [showCategoryForm, setShowCategoryForm] = useState(false);
  const [categoryFormData, setCategoryFormData] = useState({ name: '', key: '' });
  const [packageFormData, setPackageFormData] = useState({
    name: '', price: '', duration: '', people: '', outfits: '', backdrops: '', images: '', location: '', special: '', note: '', isActive: true
  });

  // Sync localPackages and localCategoryNames to localStorage
  React.useEffect(() => {
    localStorage.setItem('peridotPackages', JSON.stringify(localPackages));
  }, [localPackages]);
  React.useEffect(() => {
    localStorage.setItem('peridotCategoryNames', JSON.stringify(localCategoryNames));
  }, [localCategoryNames]);

  // Handler: Add Category
  function addCategory() {
    if (!categoryFormData.key || !categoryFormData.name) return alert('Please enter both key and name.');
    if (localPackages[categoryFormData.key]) return alert('Category key already exists.');
    setLocalPackages(prev => ({ ...prev, [categoryFormData.key]: [] }));
    setLocalCategoryNames(prev => ({ ...prev, [categoryFormData.key]: categoryFormData.name }));
    setSelectedCategory(categoryFormData.key);
    setCategoryFormData({ name: '', key: '' });
    setShowCategoryForm(false);
  }

  // Handler: Add Package
  function addPackage() {
    if (!selectedCategory) return alert('Select a category first.');
    if (!packageFormData.name || !packageFormData.price) return alert('Name and price required.');
    const newPkg = { ...packageFormData, id: `${packageFormData.name.replace(/\s+/g, '-').toLowerCase()}-${Date.now()}` };
    setLocalPackages(prev => ({
      ...prev,
      [selectedCategory]: [...(prev[selectedCategory] || []), newPkg]
    }));
    setShowPackageEditor(false);
    setEditingPackage(null);
    setPackageFormData({ name: '', price: '', duration: '', people: '', outfits: '', backdrops: '', images: '', location: '', special: '', note: '', isActive: true });
  }

  // Handler: Update Package
  function updatePackage() {
    setLocalPackages(prev => ({
      ...prev,
      [selectedCategory]: prev[selectedCategory].map(pkg =>
        pkg.id === editingPackage.id ? { ...packageFormData, id: editingPackage.id } : pkg
      )
    }));
    setShowPackageEditor(false);
    setEditingPackage(null);
    setPackageFormData({ name: '', price: '', duration: '', people: '', outfits: '', backdrops: '', images: '', location: '', special: '', note: '', isActive: true });
  }

  // Handler: Edit Package
  function editPackage(pkg) {
    setEditingPackage(pkg);
    setPackageFormData({ ...pkg });
    setShowPackageEditor(true);
  }

  // Handler: Duplicate Package
  function duplicatePackage(pkg) {
    const newPkg = { ...pkg, id: `${pkg.name.replace(/\s+/g, '-').toLowerCase()}-copy-${Date.now()}`, name: pkg.name + ' (Copy)' };
    setLocalPackages(prev => ({
      ...prev,
      [selectedCategory]: [...prev[selectedCategory], newPkg]
    }));
  }

  // Handler: Delete Package
  function deletePackage(id) {
    if (!window.confirm('Delete this package?')) return;
    setLocalPackages(prev => ({
      ...prev,
      [selectedCategory]: prev[selectedCategory].filter(pkg => pkg.id !== id)
    }));
  }

  // Handler: Toggle Package Status
  function togglePackageStatus(id) {
    setLocalPackages(prev => ({
      ...prev,
      [selectedCategory]: prev[selectedCategory].map(pkg =>
        pkg.id === id ? { ...pkg, isActive: pkg.isActive === false ? true : false } : pkg
      )
    }));
  }

  // Load blocked dates from localStorage
  React.useEffect(() => {
    const saved = localStorage.getItem('peridotBlockedDates');
    if (saved) {
      setBlockedDates(JSON.parse(saved));
    }
  }, []);

  // Load blocked time slots from localStorage
  React.useEffect(() => {
    const saved = localStorage.getItem('peridotBlockedTimeSlots');
    if (saved) {
      setBlockedTimeSlots(JSON.parse(saved));
    }
  }, []);

  // Load fake bookings from localStorage
  React.useEffect(() => {
    const saved = localStorage.getItem('peridotFakeBookings');
    if (saved) {
      setFakeBookings(JSON.parse(saved));
    }
  }, []);

  // HST Calculation (13% for Ontario, Canada)
  const calculateHST = (amount) => {
    const subtotal = parseFloat(amount) || 0;
    const hst = subtotal * 0.13;
    const total = subtotal + hst;
    return {
      subtotal: Math.round(subtotal * 100) / 100,
      hst: Math.round(hst * 100) / 100,
      total: Math.round(total * 100) / 100
    };
  };

  // Block/Unblock date functions
  const toggleDateBlock = (date) => {
    setBlockedDates(prev => {
      const newBlocked = prev.includes(date) 
        ? prev.filter(d => d !== date)
        : [...prev, date];
      
      localStorage.setItem('peridotBlockedDates', JSON.stringify(newBlocked));
      return newBlocked;
    });
  };

  // Block/Unblock time slot functions
  const toggleTimeSlotBlock = (date, time) => {
    setBlockedTimeSlots(prev => {
      const dateKey = date;
      const currentSlots = prev[dateKey] || [];
      const newSlots = currentSlots.includes(time)
        ? currentSlots.filter(t => t !== time)
        : [...currentSlots, time];
      
      const newBlockedTimeSlots = {
        ...prev,
        [dateKey]: newSlots
      };
      
      localStorage.setItem('peridotBlockedTimeSlots', JSON.stringify(newBlockedTimeSlots));
      return newBlockedTimeSlots;
    });
  };

  // Add/Remove fake booking functions
  const addFakeBooking = (date, time, clientName = 'Test Client') => {
    setFakeBookings(prev => {
      const dateKey = date;
      const currentBookings = prev[dateKey] || [];
      const newBookings = [...currentBookings, { time, clientName }];
      const newFakeBookings = { ...prev, [dateKey]: newBookings };
      localStorage.setItem('peridotFakeBookings', JSON.stringify(newFakeBookings));
      return newFakeBookings;
    });
  };

  const removeFakeBooking = (date, time) => {
    setFakeBookings(prev => {
      const dateKey = date;
      const currentBookings = prev[dateKey] || [];
      const newBookings = currentBookings.filter(b => b.time !== time);
      const newFakeBookings = { ...prev, [dateKey]: newBookings };
      localStorage.setItem('peridotFakeBookings', JSON.stringify(newFakeBookings));
      return newFakeBookings;
    });
  };

  // Invoice generation
  const generateInvoice = (booking) => {
    const invoiceNumber = `INV-${Date.now()}`;
    const hstBreakdown = calculateHSTBreakdown(booking.totalPrice);
    
    const invoice = {
      invoiceNumber,
      clientName: booking.clientName,
      email: booking.email,
      phone: booking.phone,
      package: booking.package,
      sessionDate: booking.date,
      sessionTime: booking.time,
      addons: booking.addons || [],
      discount: booking.discount,
      subtotal: hstBreakdown.serviceAmount,
      hst: hstBreakdown.hstAmount,
      total: hstBreakdown.total,
      issueDate: new Date().toISOString().split('T')[0],
      dueDate: booking.date,
      status: 'sent',
      createdAt: new Date().toISOString()
    };
    
    return invoice;
  };

  // Download invoice as professional HTML
  const downloadInvoice = (booking) => {
    const invoice = generateInvoice(booking);
    const hstBreakdown = calculateHSTBreakdown(booking.totalPrice);
    
    const invoiceHTML = `
      <!DOCTYPE html>
      <html>
      <head>
          <meta charset="UTF-8">
          <title>Invoice ${invoice.invoiceNumber}</title>
          <style>
              body { font-family: 'Segoe UI', Arial, sans-serif; margin: 40px; color: #2d3748; }
              .invoice-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 40px; border-bottom: 3px solid #f59e0b; padding-bottom: 20px; }
              .logo { font-size: 2.5rem; font-weight: bold; color: #f59e0b; }
              .company-info { text-align: right; }
              .invoice-title { font-size: 2rem; font-weight: bold; color: #2d3748; margin-bottom: 30px; }
              .invoice-details { display: grid; grid-template-columns: 1fr 1fr; gap: 40px; margin-bottom: 40px; }
              .details-section h3 { color: #f59e0b; margin-bottom: 15px; font-size: 1.2rem; }
              .details-section p { margin: 5px 0; line-height: 1.6; }
              .invoice-table { width: 100%; border-collapse: collapse; margin-bottom: 30px; }
              .invoice-table th { background: #f59e0b; color: white; padding: 15px; text-align: left; }
              .invoice-table td { padding: 12px 15px; border-bottom: 1px solid #e2e8f0; }
              .invoice-table tr:nth-child(even) { background: #f7fafc; }
              .totals { margin-left: auto; width: 300px; }
              .total-row { display: flex; justify-content: space-between; padding: 8px 0; }
              .total-row.final { font-weight: bold; font-size: 1.2rem; color: #f59e0b; border-top: 2px solid #f59e0b; padding-top: 15px; }
              .footer { margin-top: 50px; text-align: center; color: #718096; border-top: 1px solid #e2e8f0; padding-top: 20px; }
              .hst-note { background: #fef7ed; border: 1px solid #f59e0b; border-radius: 8px; padding: 15px; margin: 20px 0; }
          </style>
      </head>
      <body>
          <div class="invoice-header">
              <div>
                  <div class="logo">Peridot Images</div>
                  <p style="margin: 5px 0; color: #718096;">Professional Photography Services</p>
              </div>
              <div class="company-info">
                  <p><strong>Peridot Images</strong></p>
                  <p>Barrhaven Studio, Ottawa</p>
                  <p>📧 imagesbyperidot@gmail.com</p>
                  <p>📱 (647) 444-3767</p>
                  <p>📸 @peridotimages</p>
              </div>
          </div>

          <div class="invoice-title">INVOICE ${invoice.invoiceNumber}</div>

          <div class="invoice-details">
              <div class="details-section">
                  <h3>Bill To:</h3>
                  <p><strong>${booking.clientName}</strong></p>
                  <p>📧 ${booking.email}</p>
                  <p>📱 ${booking.phone}</p>
              </div>
              <div class="details-section">
                  <h3>Session Details:</h3>
                  <p><strong>Date:</strong> ${new Date(booking.date).toLocaleDateString('en-CA', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
                  <p><strong>Time:</strong> ${booking.time}</p>
                  <p><strong>Duration:</strong> ${booking.duration}</p>
                  <p><strong>Location:</strong> Barrhaven Studio, Ottawa</p>
              </div>
          </div>

          <table class="invoice-table">
              <thead>
                  <tr>
                      <th>Description</th>
                      <th>Quantity</th>
                      <th>Rate</th>
                      <th>Amount</th>
                  </tr>
              </thead>
              <tbody>
                  <tr>
                      <td><strong>${booking.package}</strong><br><small>Professional photography session</small></td>
                      <td>1</td>
                      <td>$${booking.packagePrice || booking.totalPrice}</td>
                      <td>$${booking.packagePrice || booking.totalPrice}</td>
                  </tr>
                  ${(booking.addons || []).map(addon => `
                      <tr>
                          <td>${addon.name}<br><small>${addon.description}</small></td>
                          <td>1</td>
                          <td>$${addon.price}</td>
                          <td>$${addon.price}</td>
                      </tr>
                  `).join('')}
                  ${booking.discount ? `
                      <tr>
                          <td><strong>Discount: ${booking.discount.code}</strong><br><small>${booking.discount.description}</small></td>
                          <td>1</td>
                          <td>-$${booking.discount.type === 'fixed' ? booking.discount.value : Math.round((hstBreakdown.serviceAmount * booking.discount.value / 100) * 100) / 100}</td>
                          <td>-$${booking.discount.type === 'fixed' ? booking.discount.value : Math.round((hstBreakdown.serviceAmount * booking.discount.value / 100) * 100) / 100}</td>
                      </tr>
                  ` : ''}
              </tbody>
          </table>

          <div class="totals">
              <div class="total-row">
                  <span>Subtotal:</span>
                  <span>$${hstBreakdown.serviceAmount}</span>
              </div>
              <div class="total-row">
                  <span>HST (13%):</span>
                  <span>$${hstBreakdown.hstAmount}</span>
              </div>
              <div class="total-row final">
                  <span>Total:</span>
                  <span>$${hstBreakdown.total}</span>
              </div>
          </div>

          <div class="hst-note">
              <strong>HST Information:</strong> This invoice includes 13% Harmonized Sales Tax (HST) as required for Ontario, Canada.
          </div>

          <div class="footer">
              <p><strong>Payment Instructions:</strong></p>
              <p>Please send e-transfer to: <strong>alongejoan@gmail.com</strong></p>
              <p>Reference: ${booking.clientName} - Invoice ${invoice.invoiceNumber}</p>
              <p style="margin-top: 20px;">Thank you for choosing Peridot Images!</p>
          </div>
      </body>
      </html>
    `;
    
    const blob = new Blob([invoiceHTML], { type: 'text/html' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Peridot-Invoice-${invoice.invoiceNumber}.html`;
    a.click();
    window.URL.revokeObjectURL(url);
    
    // Mark invoice as sent in booking
    updateBookingStatus(booking.id, booking.status, booking.paymentStatus, { invoiceSent: true });
  };

  // Email invoice to client
  const emailInvoice = (booking) => {
    const invoice = generateInvoice(booking);
    const hstBreakdown = calculateHSTBreakdown(booking.totalPrice);
    
    const subject = `Invoice ${invoice.invoiceNumber} - Your Peridot Images Session`;
    const body = `Hi ${booking.clientName},

Thank you for booking with Peridot Images! Please find your invoice details below:

📋 INVOICE DETAILS:
Invoice Number: ${invoice.invoiceNumber}
Session Date: ${new Date(booking.date).toLocaleDateString('en-CA', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
Session Time: ${booking.time}
Package: ${booking.package}

💰 PAYMENT BREAKDOWN:
Subtotal: $${hstBreakdown.serviceAmount}
HST (13%): $${hstBreakdown.hstAmount}
Total: $${hstBreakdown.total}

💳 PAYMENT INSTRUCTIONS:
Please send e-transfer to: alongejoan@gmail.com
Reference: ${booking.clientName} - Invoice ${invoice.invoiceNumber}

📍 SESSION LOCATION:
Barrhaven Studio, Ottawa

We're excited to create beautiful memories with you!

Best regards,
Peridot Images Team
📧 imagesbyperidot@gmail.com
📱 (647) 444-3767
📸 @peridotimages`;

    const mailtoLink = `mailto:${booking.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    window.location.href = mailtoLink;
    
    // Mark invoice as sent
    updateBookingStatus(booking.id, booking.status, booking.paymentStatus, { invoiceSent: true });
  };

  // Auto-send invoice when payment confirmed
  const confirmBookingWithInvoice = (bookingId) => {
    const booking = bookings.find(b => b.id === bookingId);
    if (booking) {
      updateBookingStatus(bookingId, 'confirmed', 'paid');
      emailInvoice(booking);
      alert('✅ Booking confirmed and invoice sent to client!');
    }
  };

  // Admin functions
  const handleAdminLogin = () => {
    const email = adminCredentials.email.trim().toLowerCase();
    const password = adminCredentials.password.trim();
    
    if (email === 'imagesbyperidot@gmail.com' && password === 'peridot2025') {
      setIsAdminAuthenticated(true);
      const existingBookings = JSON.parse(localStorage.getItem('peridotBookings') || '[]');
      setBookings(existingBookings);
    } else {
      alert('❌ Invalid email or password. Use the quick-fill buttons if needed.');
    }
  };

  const handleAdminLogout = () => {
    setCurrentView('client');
    setIsAdminAuthenticated(false);
    setAdminCredentials({ email: '', password: '' });
    setAdminCurrentTab('dashboard');
  };

  const updateBookingStatus = (bookingId, newStatus, paymentStatus = null, extraData = {}) => {
    setBookings(prev => {
      const updated = prev.map(booking => {
        if (booking.id === bookingId) {
          const updatedBooking = {
            ...booking,
            status: newStatus,
            ...(paymentStatus && { paymentStatus }),
            ...(newStatus === 'confirmed' && { confirmedAt: new Date().toISOString() }),
            ...(newStatus === 'cancelled' && { cancelledAt: new Date().toISOString() }),
            ...extraData // For invoice tracking, etc.
          };
          return updatedBooking;
        }
        return booking;
      });
      
      // Update localStorage
      localStorage.setItem('peridotBookings', JSON.stringify(updated));
      return updated;
    });
  };

  const calculateRevenue = () => {
    const confirmedBookings = bookings.filter(b => b.status === 'confirmed' && b.paymentStatus === 'paid');
    const totalRevenue = confirmedBookings.reduce((sum, booking) => sum + booking.totalPrice, 0);
    const monthlyRevenue = confirmedBookings
      .filter(booking => {
        const bookingDate = new Date(booking.createdAt);
        const currentMonth = new Date().getMonth();
        const currentYear = new Date().getFullYear();
        return bookingDate.getMonth() === currentMonth && bookingDate.getFullYear() === currentYear;
      })
      .reduce((sum, booking) => sum + booking.totalPrice, 0);
    
    return { totalRevenue, monthlyRevenue, confirmedCount: confirmedBookings.length };
  };

  const exportBookingsCSV = () => {
    const headers = ['Date Created', 'Client Name', 'Email', 'Phone', 'Package', 'Session Date', 'Session Time', 'Total Price', 'Status', 'Payment Status'];
    const csvData = bookings.map(booking => [
      new Date(booking.createdAt).toLocaleDateString(),
      booking.clientName,
      booking.email,
      booking.phone,
      booking.package,
      booking.date,
      booking.time,
      `$${booking.totalPrice}`,
      booking.status,
      booking.paymentStatus
    ]);
    
    const csvContent = [headers, ...csvData]
      .map(row => row.map(field => `"${field}"`).join(','))
      .join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `peridot-bookings-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  // Generate weekend dates for full year (June 2025 - May 2026)
  const generateMonthlyCalendar = () => {
    const today = new Date();
    const months = [];
    
    // Generate 12 months starting from current month
    for (let i = 0; i < 12; i++) {
      const monthDate = new Date(today.getFullYear(), today.getMonth() + i, 1);
      const monthName = monthDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
      const weekendDates = [];
      
      // Get all weekend dates for this month
      const daysInMonth = new Date(monthDate.getFullYear(), monthDate.getMonth() + 1, 0).getDate();
      
      for (let day = 1; day <= daysInMonth; day++) {
        const date = new Date(monthDate.getFullYear(), monthDate.getMonth(), day);
        const dayOfWeek = date.getDay();
        
        // Only include weekends (Saturday = 6, Sunday = 0)
        if (dayOfWeek === 0 || dayOfWeek === 6) {
          const dateString = date.toISOString().split('T')[0];
          // Only include future dates
          if (date >= today) {
            weekendDates.push({
              date: dateString,
              day: day,
              dayName: date.toLocaleDateString('en-US', { weekday: 'short' })
            });
          }
        }
      }
      
      if (weekendDates.length > 0) {
        months.push({
          name: monthName,
          dates: weekendDates
        });
      }
    }
    
    return months;
  };

  const monthlyCalendar = generateMonthlyCalendar();

  // Get available times based on selected date
  const getAvailableTimesForDate = (date) => {
    if (!date) return [];
    const dayOfWeek = new Date(date).getDay();
    
    if (dayOfWeek === 6) { // Saturday
      return ['11:00 AM', '12:00 PM', '1:00 PM', '2:00 PM', '3:00 PM', '4:00 PM'];
    } else if (dayOfWeek === 0) { // Sunday
      return ['12:00 PM', '1:00 PM', '2:00 PM', '3:00 PM', '4:00 PM'];
    }
    return [];
  };

  const selectCategory = (category) => {
    if (category === 'otherservices') {
      const mailtoLink = 'mailto:imagesbyperidot@gmail.com?subject=Photography Services Inquiry&body=Hi, I am interested in your photography services. Can you provide me with more information?';
      window.location.href = mailtoLink;
      return;
    }
    setSelectedCategory(category);
    setCurrentStep('packages');
  };

  const selectPackage = (pkg) => {
    if (selectedCategory === 'otherservices') {
      const mailtoLink = `mailto:imagesbyperidot@gmail.com?subject=${pkg.name} Inquiry&body=Hi, I am interested in ${pkg.name.toLowerCase()}. Can you provide me with more information and pricing?`;
      window.location.href = mailtoLink;
      return;
    }
    setSelectedPackage(pkg);
    setCurrentStep('addons');
  };

  const toggleAddon = (addon) => {
    setSelectedAddons(prev => {
      const isSelected = prev.find(a => a.id === addon.id);
      if (isSelected) {
        return prev.filter(a => a.id !== addon.id);
      } else {
        return [...prev, addon];
      }
    });
  };

  const applyDiscountCode = (code) => {
    const discount = discountCodes.find(d => 
      d.code === code && d.isActive && new Date(d.expiryDate) > new Date()
    );
    
    if (discount) {
      setAppliedDiscount(discount);
      setDiscountCode('');
      alert('Discount applied successfully! ✨');
      return true;
    } else {
      alert('Invalid or expired discount code');
      return false;
    }
  };

  const removeDiscount = () => {
    setAppliedDiscount(null);
  };

  // KEEP THIS FUNCTION EXACTLY THE SAME - DON'T CHANGE IT!
  const calculateTotal = () => {
    if (!selectedPackage || typeof selectedPackage.price !== 'number') return 0;
    
    const packagePrice = selectedPackage.price;
    const addonsPrice = selectedAddons.reduce((sum, addon) => sum + addon.price, 0);
    let total = packagePrice + addonsPrice;
    
    if (appliedDiscount) {
      if (appliedDiscount.type === 'percentage') {
        total = total * (1 - appliedDiscount.value / 100);
      } else if (appliedDiscount.type === 'fixed') {
        total = Math.max(0, total - appliedDiscount.value);
      }
    }
    
    return Math.round(total * 100) / 100;
  };

  // Display price with HST notice in your order summary
  const formatPriceDisplay = (price) => {
    return `$${price} (HST included)`;
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      weekday: 'short', 
      month: 'short', 
      day: 'numeric',
      year: '2-digit'
    });
  };

  const formatDateLong = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  // Form validation
  const validateForm = () => {
    const errors = {};
    
    if (!clientInfo.name || clientInfo.name.length < 2) {
      errors.name = 'Full name is required (minimum 2 characters)';
    }
    
    if (!clientInfo.email || !/\S+@\S+\.\S+/.test(clientInfo.email)) {
      errors.email = 'Valid email address is required';
    }
    
    if (!clientInfo.phone || clientInfo.phone.length < 10) {
      errors.phone = 'Valid phone number is required (minimum 10 digits)';
    }
    
    if (!clientInfo.paymentName || clientInfo.paymentName.length < 2) {
      errors.paymentName = 'Payment name is required';
    }
    
    if (!clientInfo.preferredCommunication) {
      errors.preferredCommunication = 'Please select your preferred communication method';
    }
    
    // Birthday validation (optional but if provided, must be valid format)
    if (clientInfo.birthday && !/^\d{2}-\d{2}$/.test(clientInfo.birthday)) {
      errors.birthday = 'Birthday must be in MM-DD format (e.g., 03-15)';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleClientFormSubmit = () => {
    if (validateForm()) {
      setShowTermsPopup(true);
    }
  };

  const handleTermsAccept = () => {
    setShowTermsPopup(false);
    setCurrentStep('payment');
  };

  const handleBookingComplete = () => {
    // Create booking object with proper status structure
    const newBooking = {
      id: Date.now(),
      clientName: clientInfo.name,
      email: clientInfo.email,
      phone: clientInfo.phone,
      birthday: clientInfo.birthday,
      paymentName: clientInfo.paymentName,
      preferredCommunication: clientInfo.preferredCommunication,
      package: selectedPackage.name,
      packagePrice: selectedPackage.price,
      addons: selectedAddons,
      discount: appliedDiscount,
      totalPrice: calculateTotal(),
      date: selectedDate,
      time: selectedTime,
      duration: selectedPackage.duration,
      location: 'Barrhaven Studio, Ottawa',
      status: 'held', // held, confirmed, cancelled
      paymentStatus: 'pending', // pending, paid, refunded
      createdAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 4 * 60 * 60 * 1000).toISOString(), // 4 hours from now
      confirmedAt: null,
      cancelledAt: null
    };

    // Add to bookings array (for future admin use)
    setBookings(prev => [...prev, newBooking]);
    
    // Store in localStorage for persistence until we have backend
    const existingBookings = JSON.parse(localStorage.getItem('peridotBookings') || '[]');
    existingBookings.push(newBooking);
    localStorage.setItem('peridotBookings', JSON.stringify(existingBookings));
    
    setCurrentStep('confirmation');
  };

  // CORRECT HST CALCULATION - For prices that INCLUDE HST
  const calculateHSTBreakdown = (totalPriceIncludingHST) => {
    const total = parseFloat(totalPriceIncludingHST) || 0;
    // Work backwards from total: if $250 includes HST, then service = $250 ÷ 1.13
    const serviceAmount = total / 1.13;
    const hstAmount = total - serviceAmount;
    
    return {
      serviceAmount: Math.round(serviceAmount * 100) / 100,
      hstAmount: Math.round(hstAmount * 100) / 100,
      total: Math.round(total * 100) / 100
    };
  };

  // Display price with HST notice for clients
  const formatPriceWithHSTNotice = (price) => {
    return `$${price} (HST included)`;
  };

  // Monthly HST calculator for admin
  const calculateMonthlyHST = (bookings, month = null, year = null) => {
    const currentDate = new Date();
    const targetMonth = month || currentDate.getMonth();
    const targetYear = year || currentDate.getFullYear();
    
    const monthlyBookings = bookings.filter(booking => {
      if (booking.status !== 'confirmed' || booking.paymentStatus !== 'paid') return false;
      
      const bookingDate = new Date(booking.createdAt);
      return bookingDate.getMonth() === targetMonth && bookingDate.getFullYear() === targetYear;
    });
    
    let totalRevenue = 0;
    let totalHST = 0;
    let totalSubtotal = 0;
    
    monthlyBookings.forEach(booking => {
      const breakdown = calculateHSTBreakdown(booking.totalPrice);
      totalRevenue += breakdown.total;
      totalHST += breakdown.hstAmount;
      totalSubtotal += breakdown.serviceAmount;
    });
    
    return {
      month: currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
      totalRevenue: Math.round(totalRevenue * 100) / 100,
      totalHST: Math.round(totalHST * 100) / 100,
      totalSubtotal: Math.round(totalSubtotal * 100) / 100,
      bookingCount: monthlyBookings.length,
      bookings: monthlyBookings
    };
  };

  // Generate professional invoice with HST breakdown
  const generateInvoiceWithHSTBreakdown = (booking) => {
    const invoiceNumber = `INV-${Date.now()}`;
    const hstBreakdown = calculateHSTBreakdown(booking.totalPrice);
    
    return {
      invoiceNumber,
      clientName: booking.clientName,
      email: booking.email,
      phone: booking.phone,
      package: booking.package,
      sessionDate: booking.date,
      sessionTime: booking.time,
      addons: booking.addons || [],
      discount: booking.discount,
      serviceAmount: hstBreakdown.serviceAmount,
      hstAmount: hstBreakdown.hstAmount,
      total: hstBreakdown.total, // This stays the same as booking.totalPrice
      issueDate: new Date().toISOString().split('T')[0],
      dueDate: booking.date,
      status: 'sent',
      createdAt: new Date().toISOString()
    };
  };

  // Download invoice (client pays exactly the package price, no extra)
  const downloadInvoiceWithHST = (booking) => {
    const invoice = generateInvoiceWithHSTBreakdown(booking);
    
    const invoiceHTML = `
      <!DOCTYPE html>
      <html>
      <head>
          <meta charset="UTF-8">
          <title>Invoice ${invoice.invoiceNumber}</title>
          <style>
              body { font-family: 'Segoe UI', Arial, sans-serif; margin: 40px; color: #2d3748; }
              .invoice-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 40px; border-bottom: 3px solid #f59e0b; padding-bottom: 20px; }
              .logo { font-size: 2.5rem; font-weight: bold; color: #f59e0b; }
              .company-info { text-align: right; }
              .invoice-title { font-size: 2rem; font-weight: bold; color: #2d3748; margin-bottom: 30px; }
              .invoice-details { display: grid; grid-template-columns: 1fr 1fr; gap: 40px; margin-bottom: 40px; }
              .details-section h3 { color: #f59e0b; margin-bottom: 15px; font-size: 1.2rem; }
              .details-section p { margin: 5px 0; line-height: 1.6; }
              .service-table { width: 100%; border-collapse: collapse; margin-bottom: 30px; }
              .service-table th { background: #f59e0b; color: white; padding: 15px; text-align: left; }
              .service-table td { padding: 12px 15px; border-bottom: 1px solid #e2e8f0; }
              .totals { margin-left: auto; width: 300px; background: #fef7ed; padding: 20px; border-radius: 8px; }
              .total-row { display: flex; justify-content: space-between; padding: 8px 0; }
              .total-row.final { font-weight: bold; font-size: 1.2rem; color: #f59e0b; border-top: 2px solid #f59e0b; padding-top: 15px; }
              .footer { margin-top: 50px; text-align: center; color: #718096; border-top: 1px solid #e2e8f0; padding-top: 20px; }
              .hst-note { background: #fef7ed; border: 1px solid #f59e0b; border-radius: 8px; padding: 15px; margin: 20px 0; text-align: center; }
          </style>
      </head>
      <body>
          <div class="invoice-header">
              <div>
                  <div class="logo">Peridot Images</div>
                  <p style="margin: 5px 0; color: #718096;">Professional Photography Services</p>
              </div>
              <div class="company-info">
                  <p><strong>Peridot Images</strong></p>
                  <p>Barrhaven Studio, Ottawa</p>
                  <p>📧 imagesbyperidot@gmail.com</p>
                  <p>📱 (647) 444-3767</p>
                  <p>📸 @peridotimages</p>
              </div>
          </div>

          <div class="invoice-title">INVOICE ${invoice.invoiceNumber}</div>

          <div class="invoice-details">
              <div class="details-section">
                  <h3>Bill To:</h3>
                  <p><strong>${booking.clientName}</strong></p>
                  <p>📧 ${booking.email}</p>
                  <p>📱 ${booking.phone}</p>
              </div>
              <div class="details-section">
                  <h3>Session Details:</h3>
                  <p><strong>Date:</strong> ${new Date(booking.date).toLocaleDateString('en-CA', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
                  <p><strong>Time:</strong> ${booking.time}</p>
                  <p><strong>Duration:</strong> ${booking.duration}</p>
                  <p><strong>Location:</strong> Barrhaven Studio, Ottawa</p>
              </div>
          </div>

          <table class="service-table">
              <thead>
                  <tr>
                      <th>Description</th>
                      <th>Amount</th>
                  </tr>
              </thead>
              <tbody>
                  <tr>
                      <td><strong>${booking.package}</strong><br><small>Professional photography session</small></td>
                      <td><strong>$${invoice.total}</strong></td>
                  </tr>
              </tbody>
          </table>

          <div class="totals">
              <div class="total-row">
                  <span>Service Amount:</span>
                  <span>$${invoice.serviceAmount}</span>
              </div>
              <div class="total-row">
                  <span>HST (13%):</span>
                  <span>$${invoice.hstAmount}</span>
              </div>
              <div class="total-row final">
                  <span>Total Amount Due:</span>
                  <span>$${invoice.total}</span>
              </div>
          </div>

          <div class="hst-note">
              <strong>Note:</strong> All quoted prices include HST. No additional taxes will be charged.
          </div>

          <div class="footer">
              <p><strong>Payment Instructions:</strong></p>
              <p>Please send e-transfer to: <strong>alongejoan@gmail.com</strong></p>
              <p>Reference: ${booking.clientName} - Invoice ${invoice.invoiceNumber}</p>
              <p style="margin-top: 20px;">Thank you for choosing Peridot Images!</p>
          </div>
      </body>
      </html>
    `;
    
    const blob = new Blob([invoiceHTML], { type: 'text/html' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Peridot-Invoice-${invoice.invoiceNumber}.html`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  // Calculate monthly HST for admin tracking
  const calculateMonthlyHSTReport = (bookings) => {
    const currentDate = new Date();
    const currentMonth = currentDate.getMonth();
    const currentYear = currentDate.getFullYear();
    
    // Get this month's confirmed bookings
    const thisMonthBookings = bookings.filter(booking => {
      if (booking.status !== 'confirmed' || booking.paymentStatus !== 'paid') return false;
      const bookingDate = new Date(booking.createdAt);
      return bookingDate.getMonth() === currentMonth && bookingDate.getFullYear() === currentYear;
    });
    
    // Calculate totals
    let totalRevenue = 0;
    let totalHST = 0;
    let totalServiceAmount = 0;
    
    const detailedBookings = thisMonthBookings.map(booking => {
      const breakdown = calculateHSTBreakdown(booking.totalPrice);
      totalRevenue += breakdown.total;
      totalHST += breakdown.hstAmount;
      totalServiceAmount += breakdown.serviceAmount;
      
      return {
        ...booking,
        breakdown
      };
    });
    
    return {
      month: currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
      totalRevenue: Math.round(totalRevenue * 100) / 100,
      totalHST: Math.round(totalHST * 100) / 100,
      totalServiceAmount: Math.round(totalServiceAmount * 100) / 100,
      bookingCount: thisMonthBookings.length,
      bookings: detailedBookings
    };
  };

  // Export HST report for CRA
  const exportHSTReport = (bookings) => {
    const report = calculateMonthlyHSTReport(bookings);
    
    const csvData = [
      ['Peridot Images - Monthly HST Report'],
      [`Period: ${report.month}`],
      [''],
      ['SUMMARY FOR CRA:'],
      [`Total Revenue: $${report.totalRevenue}`],
      [`Service Amount: $${report.totalServiceAmount}`],
      [`HST Collected: $${report.totalHST}`],
      [`Sessions Count: ${report.bookingCount}`],
      [''],
      ['BOOKING DETAILS:'],
      ['Date', 'Client', 'Package', 'Total Price', 'Service Amount', 'HST Collected'],
      ...report.bookings.map(booking => [
        booking.date,
        booking.clientName,
        booking.package,
        `$${booking.breakdown.total}`,
        `$${booking.breakdown.serviceAmount}`,
        `$${booking.breakdown.hstAmount}`
      ])
    ];
    
    const csvContent = csvData.map(row => 
      Array.isArray(row) ? row.join(',') : row
    ).join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `HST-Report-${report.month.replace(' ', '-')}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  // Export monthly HST report for CRA
  const exportMonthlyHSTReport = (bookings, month, year) => {
    const report = calculateMonthlyHST(bookings, month, year);
    
    const csvContent = [
      ['Peridot Images - Monthly HST Report'],
      [`Month: ${report.month}`],
      [''],
      ['Summary:'],
      [`Total Revenue (HST Included): $${report.totalRevenue}`],
      [`Service Amount: $${report.totalSubtotal}`],
      [`HST Collected: $${report.totalHST}`],
      [`Number of Sessions: ${report.bookingCount}`],
      [''],
      ['Booking Details:'],
      ['Date', 'Client', 'Package', 'Total', 'Service Amount', 'HST Amount'],
      ...report.bookings.map(booking => {
        const breakdown = calculateHSTBreakdown(booking.totalPrice);
        return [
          booking.date,
          booking.clientName,
          booking.package,
          `$${breakdown.total}`,
          `$${breakdown.serviceAmount}`,
          `$${breakdown.hstAmount}`
        ];
      })
    ].map(row => Array.isArray(row) ? row.join(',') : row).join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `HST-Report-${report.month.replace(' ', '-')}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  // Add this helper function below your generateMonthlyCalendar or near other calendar helpers:
  function generateYearCalendar() {
    // Generate 12 months starting from current month
    const today = new Date();
    const months = [];
    for (let i = 0; i < 12; i++) {
      const monthDate = new Date(today.getFullYear(), today.getMonth() + i, 1);
      const monthName = monthDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
      const daysInMonth = new Date(monthDate.getFullYear(), monthDate.getMonth() + 1, 0).getDate();
      const dates = [];
      for (let day = 1; day <= daysInMonth; day++) {
        const dateObj = new Date(monthDate.getFullYear(), monthDate.getMonth(), day);
        const dateString = dateObj.toISOString().split('T')[0];
        // Only show weekends (Saturday=6, Sunday=0)
        const dayOfWeek = dateObj.getDay();
        if (dayOfWeek === 0 || dayOfWeek === 6) {
          const isBlocked = blockedDates.includes(dateString);
          const hasBooking = bookings.some(b => b.date === dateString && b.status !== 'cancelled');
          dates.push({
            date: dateString,
            day,
            dayName: dateObj.toLocaleDateString('en-US', { weekday: 'short' }),
            isBlocked,
            hasBooking
          });
        }
      }
      months.push({ name: monthName, dates });
    }
    return months;
  }

  // Get all bookings for a specific date
  const getBookingsForDate = (date) => {
    return bookings.filter(booking => 
      booking.date === date && booking.status !== 'cancelled'
    );
  };

  // Get time slots with booking info for a specific date
  const getTimeSlotInfo = (date) => {
    const timeSlots = ['9:00 AM', '10:00 AM', '11:00 AM', '12:00 PM', '1:00 PM', '2:00 PM', '3:00 PM', '4:00 PM', '5:00 PM', '6:00 PM'];
    const dayOfWeek = new Date(date).getDay();
    
    // Filter times based on day (Saturday/Sunday only)
    const availableTimes = dayOfWeek === 6 ? 
      ['11:00 AM', '12:00 PM', '1:00 PM', '2:00 PM', '3:00 PM', '4:00 PM'] :
      dayOfWeek === 0 ? 
      ['12:00 PM', '1:00 PM', '2:00 PM', '3:00 PM', '4:00 PM'] :
      [];

    return availableTimes.map(time => {
      const realBooking = bookings.find(b => b.date === date && b.time === time && b.status !== 'cancelled');
      const isBlocked = blockedTimeSlots[date]?.includes(time);
      const fakeBooking = fakeBookings[date]?.find(fb => fb.time === time);
      
      return {
        time,
        status: realBooking ? 'booked' : isBlocked ? 'blocked' : 'available',
        booking: realBooking,
        fakeBooking: fakeBooking
      };
    });
  };

  // Generate week view data
  const generateWeekView = (startDate) => {
    const week = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date(startDate);
      date.setDate(startDate.getDate() + i);
      const dateString = date.toISOString().split('T')[0];
      const dayOfWeek = date.getDay();
      
      // Only include weekends
      if (dayOfWeek === 0 || dayOfWeek === 6) {
        week.push({
          date: dateString,
          dayName: date.toLocaleDateString('en-US', { weekday: 'short' }),
          dayNumber: date.getDate(),
          timeSlots: getTimeSlotInfo(dateString),
          bookings: getBookingsForDate(dateString)
        });
      }
    }
    return week;
  };

  // Get current week start (find the nearest Saturday)
  const getCurrentWeekStart = () => {
    const today = new Date();
    const currentDay = today.getDay();
    const daysUntilSaturday = (6 - currentDay) % 7;
    const saturday = new Date(today);
    saturday.setDate(today.getDate() + daysUntilSaturday);
    return saturday;
  };

  // Discount management functions
  function calculateDiscountStats() {
    const now = new Date();
    let totalCodes = discountCodes.length;
    let activeCodes = discountCodes.filter(dc => dc.isActive && (!dc.expiryDate || new Date(dc.expiryDate) >= now)).length;
    let expiredCodes = discountCodes.filter(dc => dc.expiryDate && new Date(dc.expiryDate) < now).length;
    let totalUsage = bookings.filter(b => b.discount && b.discount.code).length;
    return { totalCodes, activeCodes, expiredCodes, totalUsage };
  }

  function resetDiscountForm() {
    setDiscountFormData({
      code: '',
      type: 'percentage',
      value: '',
      description: '',
      expiryDate: '',
      usageLimit: '',
      isActive: true
    });
  }

  function exportDiscountReport() {
    const rows = [
      ['Code', 'Type', 'Value', 'Description', 'Expiry Date', 'Usage Limit', 'Active', 'Created At', 'Usage Count'],
      ...discountCodes.map(dc => [
        dc.code,
        dc.type,
        dc.value,
        dc.description,
        dc.expiryDate || '',
        dc.usageLimit || '',
        dc.isActive ? 'Yes' : 'No',
        dc.createdAt ? new Date(dc.createdAt).toLocaleDateString() : '',
        getBookingsWithDiscount(dc.code).length
      ])
    ];
    const csv = rows.map(r => r.map(x => `"${x}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'discount-report.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  }

  function updateDiscountCode() {
    setDiscountCodes(prev => prev.map(dc =>
      dc.id === discountFormData.id ? { ...discountFormData, id: discountFormData.id, createdAt: dc.createdAt || new Date().toISOString() } : dc
    ));
    setShowDiscountForm(false);
    setEditingDiscount(null);
    resetDiscountForm();
  }

  function createDiscountCode() {
    const newCode = {
      ...discountFormData,
      id: discountFormData.code,
      createdAt: new Date().toISOString(),
    };
    setDiscountCodes(prev => [...prev, newCode]);
    setShowDiscountForm(false);
    setEditingDiscount(null);
    resetDiscountForm();
  }

  function getBookingsWithDiscount(code) {
    return bookings.filter(b => b.discount && b.discount.code === code);
  }

  function startEditingDiscount(discount) {
    setEditingDiscount(discount);
    setDiscountFormData({ ...discount });
    setShowDiscountForm(true);
  }

  function toggleDiscountStatus(id) {
    setDiscountCodes(prev => prev.map(dc =>
      dc.id === id ? { ...dc, isActive: !dc.isActive } : dc
    ));
  }

  function deleteDiscountCode(id) {
    if (window.confirm('Are you sure you want to delete this discount code?')) {
      setDiscountCodes(prev => prev.filter(dc => dc.id !== id));
      if (editingDiscount && editingDiscount.id === id) {
        setEditingDiscount(null);
        resetDiscountForm();
        setShowDiscountForm(false);
      }
    }
  }

  return (
    <div className="luxury-container">
      <div className="luxury-background">
        
        {/* Welcome Screen */}
        {currentStep === 'welcome' && currentView === 'client' && (
          <>
            {/* Admin Access Button */}
            <div className="admin-access">
              <button
                onClick={() => setCurrentView('admin')}
                className="admin-access-button"
              >
                Admin Access
              </button>
            </div>

            <header className="luxury-header">
              <div className="fade-in">
                <div className="luxury-logo">
                  <div className="logo-circle">
                    <span className="logo-text">P</span>
                  </div>
                </div>
                
                <h1 className="main-title">Peridot Images</h1>
                <p className="subtitle">Capturing Life's Most Precious Moments</p>
                <p className="description">
                  Experience luxury photography in Ottawa's most elegant studio space. 
                  Where every moment becomes a timeless masterpiece.
                </p>
              </div>
            </header>

            <div className="luxury-card-container">
              <div className="luxury-card">
                <h2 className="card-title">Welcome to Your Photography Journey</h2>
                
                <p className="card-description">
                  Let us create beautiful memories together. Our luxury booking experience 
                  makes it effortless to schedule your perfect photography session.
                </p>
                
                <div className="features-grid">
                  <div className="feature-item">
                    <div className="feature-icon">📸</div>
                    <h3 className="feature-title">Choose Your Experience</h3>
                    <p className="feature-description">Select from our curated collection of photography experiences</p>
                  </div>
                  
                  <div className="feature-item">
                    <div className="feature-icon">📅</div>
                    <h3 className="feature-title">Book Your Session</h3>
                    <p className="feature-description">Choose your perfect date and time with our elegant calendar</p>
                  </div>
                  
                  <div className="feature-item">
                    <div className="feature-icon">✨</div>
                    <h3 className="feature-title">Create Magic</h3>
                    <p className="feature-description">Relax while we capture your most beautiful moments</p>
                  </div>
                </div>
                
                <button 
                  className="luxury-button"
                  onClick={() => setCurrentStep('categories')}
                >
                  Begin Your Booking Experience
                </button>
                
                <div className="help-text">
                  <p>Questions? We're here to help you every step of the way.</p>
                </div>
              </div>
            </div>

            <footer className="luxury-footer">
              <div className="footer-content">
                <p>📧 imagesbyperidot@gmail.com | 📱 (647) 444-3767</p>
                <p>📍 Barrhaven Studio, Ottawa</p>
                <p>Follow us: <span className="instagram-handle">@peridotimages</span></p>
              </div>
            </footer>
          </>
        )}

        {/* Category Selection */}
        {currentStep === 'categories' && (
          <>
            <header className="step-header">
              <h2 className="step-title">Choose Your Photography Experience</h2>
              <p className="step-subtitle">Select the perfect service to capture your most precious moments</p>
            </header>

            <div className="categories-grid">
              {Object.entries(categoryNames).map(([key, name]) => {
                const categoryPackages = packages[key];
                const minPrice = categoryPackages && Array.isArray(categoryPackages) ? 
                  Math.min(...categoryPackages.map(p => typeof p.price === 'number' ? p.price : Infinity)) : 
                  'Contact';
                
                return (
                  <div key={key} className="category-card-wrapper">
                    <div 
                      className={`category-card ${key === 'family' ? 'popular' : ''}`}
                      onClick={() => selectCategory(key)}
                    >
                      {key === 'family' && (
                        <div className="popular-badge">
                          ✨ Most Popular
                        </div>
                      )}
                      
                      <div className="category-content">
                        <h3 className="category-name">{name}</h3>
                        <div className="category-price">
                          {minPrice === 'Contact' || minPrice === Infinity ? 'Contact for Pricing' : `Starting at $${minPrice}`}
                        </div>
                        <div className="category-cta">
                          <span className="cta-button">View Packages</span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="alternative-contact">
              <p className="alt-text">Can't find a suitable date in our calendar?</p>
              <button
                onClick={() => {
                  const mailtoLink = 'mailto:imagesbyperidot@gmail.com?subject=Alternative Date Request&body=Hi, I cannot find a suitable date in your calendar. Can you help me find an alternative time slot?';
                  window.location.href = mailtoLink;
                }}
                className="alt-button"
              >
                Contact Us for Alternative Dates
              </button>
            </div>

            <div className="back-to-welcome">
              <button
                onClick={() => setCurrentStep('welcome')}
                className="back-button"
              >
                ← Back to Welcome
              </button>
            </div>
          </>
        )}

        {/* Package Selection */}
        {currentStep === 'packages' && selectedCategory && (
          <div className="package-selection">
            <header className="step-header">
              <button
                onClick={() => setCurrentStep('categories')}
                className="back-button"
              >
                ← Back to Categories
              </button>
              <h2 className="step-title">{categoryNames[selectedCategory]}</h2>
            </header>
            
            <div className="packages-grid">
              {packages[selectedCategory] && packages[selectedCategory].map((pkg) => (
                <div key={pkg.id} className="package-card">
                  <div className="package-header">
                    <h3 className="package-name">{pkg.name}</h3>
                    <span className="package-price">
                      {typeof pkg.price === 'number' ? `$${pkg.price}` : pkg.price}
                    </span>
                  </div>
                  
                  <div className="package-details">
                    <div className="detail-item">⏱️ Duration: {pkg.duration}</div>
                    <div className="detail-item">👥 People: {pkg.people}</div>
                    <div className="detail-item">👔 Outfits: {pkg.outfits}</div>
                    <div className="detail-item">🎬 Backdrops: {pkg.backdrops}</div>
                    <div className="detail-item">📸 Images: {pkg.images}</div>
                    <div className="detail-item">📍 Location: {pkg.location}</div>
                    {pkg.special && <div className="detail-special">✨ {pkg.special}</div>}
                    {pkg.note && <div className="detail-note">📝 {pkg.note}</div>}
                  </div>
                  
                  <button 
                    className="select-package-button"
                    onClick={() => selectPackage(pkg)}
                  >
                    Select This Package
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Add-ons Selection */}
        {currentStep === 'addons' && selectedPackage && (
          <div className="addons-selection">
            <header className="step-header">
              <button
                onClick={() => setCurrentStep('packages')}
                className="back-button"
              >
                ← Back to Packages
              </button>
              <h2 className="step-title">Add-ons & Extras</h2>
              <p className="step-subtitle">Enhance your photography experience with these luxury add-ons</p>
            </header>

            <div className="selected-package-summary">
              <h3 className="summary-title">Selected Package</h3>
              <div className="summary-content">
                <span className="summary-name">{selectedPackage.name}</span>
                <span className="summary-price">${selectedPackage.price}</span>
              </div>
            </div>

            <div className="addons-grid">
              {addons.map((addon) => {
                const isSelected = selectedAddons.find(a => a.id === addon.id);
                return (
                  <div
                    key={addon.id}
                    className={`addon-card ${isSelected ? 'selected' : ''}`}
                    onClick={() => toggleAddon(addon)}
                  >
                    <div className="addon-header">
                      <h4 className="addon-name">{addon.name}</h4>
                      <span className="addon-price">+${addon.price}</span>
                    </div>
                    <p className="addon-description">{addon.description}</p>
                    {isSelected && (
                      <div className="addon-selected-indicator">
                        ✓ Added to your order
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            <div className="discount-section">
              <h3 className="discount-title">Discount Code</h3>
              <div className="discount-input-group">
                <input
                  type="text"
                  placeholder="Enter discount code"
                  value={discountCode}
                  onChange={(e) => setDiscountCode(e.target.value.toUpperCase())}
                  className="discount-input"
                />
                <button
                  onClick={() => applyDiscountCode(discountCode)}
                  className="apply-discount-button"
                >
                  Apply Discount
                </button>
              </div>
              
              {appliedDiscount && (
                <div className="applied-discount">
                  <div className="discount-info">
                    <span className="discount-code">{appliedDiscount.code}</span>
                    <p className="discount-description">{appliedDiscount.description}</p>
                  </div>
                  <button
                    onClick={removeDiscount}
                    className="remove-discount-button"
                  >
                    Remove
                  </button>
                </div>
              )}
            </div>

            <div className="order-summary">
              <h3 className="summary-title">Order Summary</h3>
              <div className="summary-items">
                <div className="summary-item">
                  <span>{selectedPackage.name}</span>
                  <span>${selectedPackage.price}</span>
                </div>
                {selectedAddons.map((addon) => (
                  <div key={addon.id} className="summary-item addon-item">
                    <span>{addon.name}</span>
                    <span>+${addon.price}</span>
                  </div>
                ))}
                {appliedDiscount && (
                  <div className="summary-item discount-item">
                    <span>{appliedDiscount.description}</span>
                    <span>
                      {appliedDiscount.type === 'percentage' && `-${appliedDiscount.value}%`}
                      {appliedDiscount.type === 'fixed' && `-$${appliedDiscount.value}`}
                    </span>
                  </div>
                )}
              </div>
              <div className="summary-total">
                <div className="total-row">
                  <span className="total-label">Total:</span>
                  <span className="total-amount">${calculateTotal()}</span>
                </div>
              </div>
            </div>

            <div className="step-navigation">
              <button
                onClick={() => setCurrentStep('packages')}
                className="nav-button secondary"
              >
                Back to Packages
              </button>
              <button
                onClick={() => setCurrentStep('datetime')}
                className="nav-button primary"
              >
                Continue to Date & Time
              </button>
            </div>
          </div>
        )}

        {/* Date & Time Selection */}
        {currentStep === 'datetime' && (
          <div className="datetime-selection">
            <header className="step-header">
              <button
                onClick={() => setCurrentStep('addons')}
                className="back-button"
              >
                ← Back to Add-ons
              </button>
              <h2 className="step-title">Select Date & Time</h2>
              <p className="step-subtitle">Choose your perfect appointment time • Weekends Only</p>
            </header>
            
            <div className="beautiful-calendar">
              {/* Month Navigation */}
              <div className="month-navigation">
                <button
                  onClick={() => setCurrentMonth(Math.max(0, currentMonth - 1))}
                  disabled={currentMonth === 0}
                  className={`month-nav-btn ${currentMonth === 0 ? 'disabled' : ''}`}
                >
                  ← Previous Month
                </button>
                
                <h3 className="current-month-title">
                  {monthlyCalendar[currentMonth]?.name}
                </h3>
                
                <button
                  onClick={() => setCurrentMonth(Math.min(monthlyCalendar.length - 1, currentMonth + 1))}
                  disabled={currentMonth === monthlyCalendar.length - 1}
                  className={`month-nav-btn ${currentMonth === monthlyCalendar.length - 1 ? 'disabled' : ''}`}
                >
                  Next Month →
                </button>
              </div>

              <div className="calendar-content">
                {/* Available Dates for Current Month */}
                <div className="month-dates-section">
                  <h4 className="section-title">Available Weekend Dates</h4>
                  <p className="section-subtitle">
                    {monthlyCalendar[currentMonth]?.dates.length || 0} dates available this month
                  </p>
                  
                  <div className="beautiful-dates-grid">
                    {monthlyCalendar[currentMonth]?.dates.map((dateObj) => (
                      <button
                        key={dateObj.date}
                        onClick={() => setSelectedDate(dateObj.date)}
                        className={`beautiful-date-card ${selectedDate === dateObj.date ? 'selected' : ''}`}
                      >
                        <div className="date-number">{dateObj.day}</div>
                        <div className="date-day-name">{dateObj.dayName}</div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Time Selection */}
                <div className="times-section">
                  <h4 className="section-title">Available Times</h4>
                  <p className="section-subtitle">
                    {selectedDate ? 
                      `${new Date(selectedDate).getDay() === 6 ? 'Saturday' : 'Sunday'} Schedule` : 
                      'Select a date to see available times'
                    }
                  </p>
                  
                  {selectedDate ? (
                    <div className="beautiful-times-grid">
                      {getAvailableTimesForDate(selectedDate).map((time) => (
                        <button
                          key={time}
                          onClick={() => setSelectedTime(time)}
                          className={`beautiful-time-card ${selectedTime === time ? 'selected' : ''}`}
                        >
                          {time}
                        </button>
                      ))}
                    </div>
                  ) : (
                    <div className="time-placeholder">
                      <div className="placeholder-icon">⏰</div>
                      <p>Please select a date first</p>
                      <div className="schedule-preview">
                        <div className="schedule-item">
                          <span className="schedule-day">Saturday:</span>
                          <span className="schedule-hours">11:00 AM - 4:00 PM</span>
                        </div>
                        <div className="schedule-item">
                          <span className="schedule-day">Sunday:</span>
                          <span className="schedule-hours">12:00 PM - 4:00 PM</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Selected Appointment Summary */}
            {selectedDate && selectedTime && (
              <div className="beautiful-appointment-summary">
                <div className="summary-header">
                  <h3 className="summary-title">✨ Your Selected Appointment</h3>
                </div>
                
                <div className="summary-grid">
                  <div className="summary-item">
                    <div className="summary-icon">📅</div>
                    <div className="summary-details">
                      <div className="summary-label">Date</div>
                      <div className="summary-value">{formatDateLong(selectedDate)}</div>
                    </div>
                  </div>
                  
                  <div className="summary-item">
                    <div className="summary-icon">⏰</div>
                    <div className="summary-details">
                      <div className="summary-label">Time</div>
                      <div className="summary-value">{selectedTime}</div>
                    </div>
                  </div>
                  
                  <div className="summary-item">
                    <div className="summary-icon">📍</div>
                    <div className="summary-details">
                      <div className="summary-label">Location</div>
                      <div className="summary-value">Barrhaven Studio, Ottawa</div>
                    </div>
                  </div>
                  
                  <div className="summary-item">
                    <div className="summary-icon">⏱️</div>
                    <div className="summary-details">
                      <div className="summary-label">Duration</div>
                      <div className="summary-value">{selectedPackage?.duration}</div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div className="step-navigation">
              <button
                onClick={() => setCurrentStep('addons')}
                className="nav-button secondary"
              >
                Back to Add-ons
              </button>
              <button
                onClick={() => setCurrentStep('clientform')}
                disabled={!selectedDate || !selectedTime}
                className={`nav-button ${selectedDate && selectedTime ? 'primary' : 'disabled'}`}
              >
                Continue to Client Information
              </button>
            </div>
          </div>
        )}

        {/* Client Information Form */}
        {currentStep === 'clientform' && (
          <div className="client-form-section">
            <header className="step-header">
              <button
                onClick={() => setCurrentStep('datetime')}
                className="back-button"
              >
                ← Back to Date & Time
              </button>
              <h2 className="step-title">Client Information</h2>
              <p className="step-subtitle">Just a few details to complete your luxury booking experience</p>
            </header>

            <div className="client-form-container">
              <div className="form-card">
                <h3 className="form-title">Your Information</h3>
                <p className="form-description">We'll use this information to confirm your booking and keep you updated.</p>

                <div className="form-grid">
                  <div className="form-group">
                    <label className="form-label">Full Name *</label>
                    <input
                      type="text"
                      value={clientInfo.name}
                      onChange={(e) => setClientInfo({...clientInfo, name: e.target.value})}
                      className={`form-input ${formErrors.name ? 'error' : ''}`}
                      placeholder="Enter your full name"
                    />
                    {formErrors.name && <span className="error-message">{formErrors.name}</span>}
                  </div>

                  <div className="form-group">
                    <label className="form-label">Email Address *</label>
                    <input
                      type="email"
                      value={clientInfo.email}
                      onChange={(e) => setClientInfo({...clientInfo, email: e.target.value})}
                      className={`form-input ${formErrors.email ? 'error' : ''}`}
                      placeholder="your.email@example.com"
                    />
                    {formErrors.email && <span className="error-message">{formErrors.email}</span>}
                  </div>

                  <div className="form-group">
                    <label className="form-label">Phone Number *</label>
                    <input
                      type="tel"
                      value={clientInfo.phone}
                      onChange={(e) => setClientInfo({...clientInfo, phone: e.target.value})}
                      className={`form-input ${formErrors.phone ? 'error' : ''}`}
                      placeholder="(647) 123-4567"
                    />
                    {formErrors.phone && <span className="error-message">{formErrors.phone}</span>}
                  </div>

                  <div className="form-group">
                    <label className="form-label">Birthday (Optional)</label>
                    <input
                      type="text"
                      value={clientInfo.birthday}
                      onChange={(e) => {
                        let value = e.target.value.replace(/\D/g, '');
                        if (value.length >= 2) {
                          value = value.substring(0, 2) + '-' + value.substring(2, 4);
                        }
                        setClientInfo({...clientInfo, birthday: value});
                      }}
                      maxLength={5}
                      className={`form-input ${formErrors.birthday ? 'error' : ''}`}
                      placeholder="MM-DD (e.g., 03-15)"
                    />
                    <small className="form-help">We'll send you special birthday offers!</small>
                    {formErrors.birthday && <span className="error-message">{formErrors.birthday}</span>}
                  </div>

                  <div className="form-group">
                    <label className="form-label">Name for Payment *</label>
                    <input
                      type="text"
                      value={clientInfo.paymentName}
                      onChange={(e) => setClientInfo({...clientInfo, paymentName: e.target.value})}
                      className={`form-input ${formErrors.paymentName ? 'error' : ''}`}
                      placeholder="Name for e-transfer payment"
                    />
                    <small className="form-help">This should match the name on your e-transfer</small>
                    {formErrors.paymentName && <span className="error-message">{formErrors.paymentName}</span>}
                  </div>

                  <div className="form-group full-width">
                    <label className="form-label">Preferred Communication *</label>
                    <select
                      value={clientInfo.preferredCommunication}
                      onChange={(e) => setClientInfo({...clientInfo, preferredCommunication: e.target.value})}
                      className={`form-input ${formErrors.preferredCommunication ? 'error' : ''}`}
                    >
                      <option value="">Select your preferred method</option>
                      <option value="email">Email</option>
                      <option value="phone">Phone Call</option>
                      <option value="text">Text Message</option>
                    </select>
                    {formErrors.preferredCommunication && <span className="error-message">{formErrors.preferredCommunication}</span>}
                  </div>
                </div>

                <div className="form-actions">
                  <button
                    onClick={() => setCurrentStep('datetime')}
                    className="form-button secondary"
                  >
                    Back to Date & Time
                  </button>
                  <button
                    onClick={handleClientFormSubmit}
                    className="form-button primary"
                  >
                    Review Terms & Continue
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Payment Instructions */}
        {currentStep === 'payment' && (
          <div className="payment-section">
            <header className="step-header">
              <h2 className="step-title">Payment Instructions</h2>
              <p className="step-subtitle">You're almost done! Complete your payment to confirm your booking</p>
            </header>

            <div className="payment-container">
              {/* Booking Summary */}
              <div className="booking-summary-card">
                <h3 className="booking-summary-title">📋 Booking Summary</h3>
                
                <div className="booking-details">
                  <div className="booking-detail-item">
                    <span className="detail-label">Service:</span>
                    <span className="detail-value">{selectedPackage.name}</span>
                  </div>
                  <div className="booking-detail-item">
                    <span className="detail-label">Date & Time:</span>
                    <span className="detail-value">{formatDateLong(selectedDate)} at {selectedTime}</span>
                  </div>
                  <div className="booking-detail-item">
                    <span className="detail-label">Client:</span>
                    <span className="detail-value">{clientInfo.name}</span>
                  </div>
                  <div className="booking-detail-item">
                    <span className="detail-label">Email:</span>
                    <span className="detail-value">{clientInfo.email}</span>
                  </div>
                  <div className="booking-detail-item">
                    <span className="detail-label">Phone:</span>
                    <span className="detail-value">{clientInfo.phone}</span>
                  </div>
                  
                  {selectedAddons.length > 0 && (
                    <div className="addons-summary">
                      <h4 className="addons-title">Add-ons:</h4>
                      {selectedAddons.map((addon) => (
                        <div key={addon.id} className="addon-summary-item">
                          <span>{addon.name}</span>
                          <span>+${addon.price}</span>
                        </div>
                      ))}
                    </div>
                  )}
                  
                  {appliedDiscount && (
                    <div className="discount-summary">
                      <span className="discount-label">Discount ({appliedDiscount.code}):</span>
                      <span className="discount-value">
                        {appliedDiscount.type === 'percentage' ? `-${appliedDiscount.value}%` : `-${appliedDiscount.value}`}
                      </span>
                    </div>
                  )}
                  
                  <div className="total-summary">
                    <span className="total-label">Total Amount:</span>
                    <span className="total-value">${calculateTotal()}</span>
                  </div>
                </div>
              </div>

              {/* Payment Instructions */}
              <div className="payment-instructions-card">
                <h3 className="payment-title">💳 E-Transfer Payment</h3>
                
                <div className="payment-steps">
                  <div className="payment-step">
                    <div className="step-number">1</div>
                    <div className="step-content">
                      <h4>Send E-Transfer</h4>
                      <p>Send your e-transfer to: <strong className="payment-email">alongejoan@gmail.com</strong></p>
                    </div>
                  </div>
                  
                  <div className="payment-step">
                    <div className="step-number">2</div>
                    <div className="step-content">
                      <h4>Payment Amount</h4>
                      <p>Amount: <strong className="payment-amount">${calculateTotal()}</strong></p>
                    </div>
                  </div>
                  
                  <div className="payment-step">
                    <div className="step-number">3</div>
                    <div className="step-content">
                      <h4>Payment Reference</h4>
                      <p>Message: <strong className="payment-reference">{clientInfo.name} - {formatDate(selectedDate)}</strong></p>
                    </div>
                  </div>
                  
                  <div className="payment-step">
                    <div className="step-number">4</div>
                    <div className="step-content">
                      <h4>Confirmation</h4>
                      <p>We'll confirm your booking within 24 hours of receiving payment</p>
                    </div>
                  </div>
                </div>

                <div className="payment-notes">
                  <h4 className="notes-title">📝 Important Notes:</h4>
                  <ul className="notes-list">
                    <li>Your session is tentatively held for 4 hours pending payment confirmation</li>
                    <li>Final confirmation will be sent via {clientInfo.preferredCommunication}</li>
                    <li>Session details and preparation guide will follow</li>
                    <li>Photos delivered within 7-10 business days via secure digital gallery</li>
                    <li>Bookings not confirmed within 4 hours will be automatically cancelled</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="step-navigation">
              <button
                onClick={() => setCurrentStep('clientform')}
                className="nav-button secondary"
              >
                Back to Client Info
              </button>
              <button
                onClick={handleBookingComplete}
                className="nav-button primary"
              >
                Payment Sent - Complete Booking
              </button>
            </div>
          </div>
        )}

        {/* Confirmation */}
        {currentStep === 'confirmation' && (
          <div className="confirmation-section">
            <div className="confirmation-container">
              <div className="success-animation">
                <div className="success-circle">
                  <div className="success-checkmark">✓</div>
                </div>
              </div>

              <h2 className="confirmation-title">🎉 Booking Held Successfully!</h2>
              <p className="confirmation-subtitle">
                Thank you, {clientInfo.name}! Your session is temporarily held pending payment confirmation.
              </p>

              <div className="confirmation-details">
                <div className="confirmation-card">
                  <h3 className="confirmation-card-title">What Happens Next?</h3>
                  
                  <div className="next-steps">
                    <div className="next-step">
                      <div className="step-icon">⏰</div>
                      <div className="step-text">
                        <strong>Booking Hold</strong>
                        <span>Your session is held for 4 hours pending payment confirmation</span>
                      </div>
                    </div>
                    
                    <div className="next-step">
                      <div className="step-icon">📧</div>
                      <div className="step-text">
                        <strong>Confirmation Email</strong>
                        <span>You'll receive booking confirmation within 24 hours of payment</span>
                      </div>
                    </div>
                    
                    <div className="next-step">
                      <div className="step-icon">📱</div>
                      <div className="step-text">
                        <strong>Session Details</strong>
                        <span>Preparation guide and studio details sent 48 hours before your session</span>
                      </div>
                    </div>
                    
                    <div className="next-step">
                      <div className="step-icon">📸</div>
                      <div className="step-text">
                        <strong>Your Session</strong>
                        <span>{formatDateLong(selectedDate)} at {selectedTime}</span>
                      </div>
                    </div>
                    
                    <div className="next-step">
                      <div className="step-icon">✨</div>
                      <div className="step-text">
                        <strong>Photo Delivery</strong>
                        <span>Beautifully edited images delivered within 7-10 business days</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="contact-card">
                  <h3 className="contact-card-title">Questions or Changes?</h3>
                  <p>We're here to help make your experience perfect!</p>
                  
                  <div className="contact-methods">
                    <div className="contact-method">
                      <span className="contact-icon">📧</span>
                      <span>imagesbyperidot@gmail.com</span>
                    </div>
                    <div className="contact-method">
                      <span className="contact-icon">📱</span>
                      <span>(647) 444-3767</span>
                    </div>
                    <div className="contact-method">
                      <span className="contact-icon">📍</span>
                      <span>Barrhaven Studio, Ottawa</span>
                    </div>
                    <div className="contact-method">
                      <span className="contact-icon">📸</span>
                      <span>@peridotimages</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="confirmation-actions">
                <button
                  onClick={() => {
                    // Reset all form data for new booking
                    setCurrentStep('welcome');
                    setSelectedCategory('');
                    setSelectedPackage(null);
                    setSelectedAddons([]);
                    setSelectedDate('');
                    setSelectedTime('');
                    setAppliedDiscount(null);
                    setDiscountCode('');
                    setClientInfo({
                      name: '', email: '', phone: '', birthday: '', paymentName: '', preferredCommunication: ''
                    });
                    setFormErrors({});
                    setCurrentMonth(0);
                  }}
                  className="confirmation-button primary"
                >
                  Book Another Session
                </button>
                
                <button
                  onClick={() => window.location.href = 'https://peridotimages.mypixieset.com/faqs/'}
                  className="confirmation-button secondary"
                >
                  View Complete FAQ
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Terms and Conditions Popup */}
        {showTermsPopup && (
          <div className="terms-overlay">
            <div className="terms-popup">
              <div className="terms-header">
                <h3 className="terms-title">Terms & Conditions</h3>
                <button
                  onClick={() => setShowTermsPopup(false)}
                  className="terms-close"
                >
                  ✕
                </button>
              </div>
              
              <div className="terms-content">
                <div className="terms-section">
                  <h4>Booking Policy</h4>
                  <p>All portrait sessions are by appointment and must be booked and scheduled in advance. Full payment is required to confirm your booking.</p>
                </div>
                
                <div className="terms-section">
                  <h4>Session Preparation</h4>
                  <p>We require clients to be prepared in terms of makeup, outfits, and hair up to the client's standards. A preparation guide will be provided.</p>
                </div>
                
                <div className="terms-section">
                  <h4>Image Delivery</h4>
                  <p>Peridot Images will provide the link for selection of images within 48hrs from the session. Final edited images will be delivered within 7-10 working days.</p>
                </div>
                
                <div className="terms-section">
                  <h4>Copyright and Usage</h4>
                  <p>Peridot Images retains the copyright to all images taken during the session. The client is granted personal usage rights for non-commercial purposes only.</p>
                </div>
                
                <div className="terms-section">
                  <h4>Cancellation & Rescheduling</h4>
                  <p>If you wish to cancel and reschedule 48 hours or earlier, no additional fees apply. Rescheduling within 48 hours will incur additional costs.</p>
                </div>
                
                <div className="terms-footer">
                  <p><strong>For complete FAQs and additional information, visit:</strong></p>
                  <a href="https://peridotimages.mypixieset.com/faqs/" target="_blank" rel="noopener noreferrer" className="faq-link">
                    peridotimages.mypixieset.com/faqs
                  </a>
                </div>
              </div>
              
              <div className="terms-actions">
                <button
                  onClick={() => setShowTermsPopup(false)}
                  className="terms-button secondary"
                >
                  Cancel
                </button>
                <button
                  onClick={handleTermsAccept}
                  className="terms-button primary"
                >
                  I Agree - Continue to Payment
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ADMIN LOGIN SCREEN */}
        {currentView === 'admin' && !isAdminAuthenticated && (
          <div className="admin-login-section">
            <div className="admin-login-container">
              <div className="admin-login-card">
                <div className="admin-header">
                  <div className="luxury-logo">
                    <div className="logo-circle">
                      <span className="logo-text">P</span>
                    </div>
                  </div>
                  <h2 className="admin-title">Admin Access</h2>
                  <p className="admin-subtitle">Secure login for Peridot Images team</p>
                </div>

                <div className="admin-form">
                  <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
                    <button
                      type="button"
                      onClick={() => setAdminCredentials({
                        email: 'imagesbyperidot@gmail.com',
                        password: ''
                      })}
                      style={{
                        background: 'rgba(245, 158, 11, 0.1)',
                        border: '1px solid rgba(245, 158, 11, 0.3)',
                        padding: '6px 12px',
                        borderRadius: '6px',
                        fontSize: '0.8rem',
                        cursor: 'pointer',
                        color: '#d97706'
                      }}
                    >
                      Fill Email
                    </button>
                    
                    <button
                      type="button"
                      onClick={() => setAdminCredentials({
                        ...adminCredentials,
                        password: 'peridot2025'
                      })}
                      style={{
                        background: 'rgba(245, 158, 11, 0.1)',
                        border: '1px solid rgba(245, 158, 11, 0.3)',
                        padding: '6px 12px',
                        borderRadius: '6px',
                        fontSize: '0.8rem',
                        cursor: 'pointer',
                        color: '#d97706'
                      }}
                    >
                      Fill Password
                    </button>
                  </div>

                  <div className="admin-form-group">
                    <label className="admin-label">Email Address</label>
                    <input
                      type="email"
                      value={adminCredentials.email}
                      onChange={(e) => setAdminCredentials({
                        ...adminCredentials, 
                        email: e.target.value.trim().toLowerCase() // Auto-trim and lowercase
                      })}
                      className="admin-input"
                      placeholder="imagesbyperidot@gmail.com"
                      autoComplete="email"
                      autoCapitalize="none"
                      autoCorrect="off"
                      spellCheck="false"
                    />
                  </div>

                  <div className="admin-form-group">
                    <label className="admin-label">Password</label>
                    <div className="admin-password-group">
                      <input
                        type={showPassword ? "text" : "password"}
                        value={adminCredentials.password}
                        onChange={(e) => setAdminCredentials({
                          ...adminCredentials, 
                          password: e.target.value.trim() // Auto-trim
                        })}
                        className="admin-input"
                        placeholder="peridot2025"
                        onKeyPress={(e) => e.key === 'Enter' && handleAdminLogin()}
                        autoComplete="current-password"
                        autoCapitalize="none"
                        autoCorrect="off"
                        spellCheck="false"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="password-toggle"
                      >
                        {showPassword ? '👁️' : '👁️‍🗨️'}
                      </button>
                    </div>
                  </div>

                  <button
                    onClick={handleAdminLogin}
                    className="admin-login-button"
                  >
                    Access Dashboard
                  </button>

                  {/* Removed Test Auto-Login button for production security */}
                </div>

                <button
                  onClick={() => setCurrentView('client')}
                  className="back-to-client"
                >
                  ← Back to Client Booking
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ADMIN DASHBOARD */}
        {currentView === 'admin' && isAdminAuthenticated && (
          <div className="admin-dashboard">
            {/* Admin Header */}
            <header className="admin-dashboard-header">
              <div className="admin-header-content">
                <div className="admin-header-left">
                  <div className="luxury-logo small">
                    <div className="logo-circle">
                      <span className="logo-text">P</span>
                    </div>
                  </div>
                  <div>
                    <h1 className="admin-dashboard-title">Peridot Admin Dashboard</h1>
                    <p className="admin-dashboard-subtitle">Manage your photography business</p>
                  </div>
                </div>
                
                <div className="admin-header-right">
                  <button
                    onClick={handleAdminLogout}
                    className="admin-logout-button"
                  >
                    Logout
                  </button>
                </div>
              </div>

              {/* Enhanced Admin Navigation */}
              <nav className="admin-nav">
                <button
                  onClick={() => setAdminCurrentTab('dashboard')}
                  className={`admin-nav-item ${adminCurrentTab === 'dashboard' ? 'active' : ''}`}
                >
                  📊 Dashboard
                </button>
                <button
                  onClick={() => setAdminCurrentTab('bookings')}
                  className={`admin-nav-item ${adminCurrentTab === 'bookings' ? 'active' : ''}`}
                >
                  📅 Bookings
                </button>
                <button
                  onClick={() => setAdminCurrentTab('calendar')}
                  className={`admin-nav-item ${adminCurrentTab === 'calendar' ? 'active' : ''}`}
                >
                  🗓️ Calendar
                </button>
                <button
                  onClick={() => setAdminCurrentTab('packages')}
                  className={`admin-nav-item ${adminCurrentTab === 'packages' ? 'active' : ''}`}
                >
                  📦 Packages
                </button>
                <button
                  onClick={() => setAdminCurrentTab('discounts')}
                  className={`admin-nav-item ${adminCurrentTab === 'discounts' ? 'active' : ''}`}
                >
                  💰 Discounts
                </button>
                <button
                  onClick={() => setAdminCurrentTab('analytics')}
                  className={`admin-nav-item ${adminCurrentTab === 'analytics' ? 'active' : ''}`}
                >
                  📈 Analytics
                </button>
                <button
                  onClick={() => setAdminCurrentTab('hst')}
                  className={`admin-nav-item ${adminCurrentTab === 'hst' ? 'active' : ''}`}
                >
                  💰 HST Calculator
                </button>
              </nav>
            </header>

            {/* Dashboard Overview */}
            {adminCurrentTab === 'dashboard' && (
              <div className="admin-content">
                <div className="dashboard-overview">
                  <h2 className="admin-section-title">Business Overview</h2>
                  
                  <div className="stats-grid">
                    <div className="stat-card revenue">
                      <div className="stat-icon">💰</div>
                      <div className="stat-content">
                        <div className="stat-value">${calculateRevenue().totalRevenue}</div>
                        <div className="stat-label">Total Revenue</div>
                      </div>
                    </div>
                    
                    <div className="stat-card monthly">
                      <div className="stat-icon">📅</div>
                      <div className="stat-content">
                        <div className="stat-value">${calculateRevenue().monthlyRevenue}</div>
                        <div className="stat-label">This Month</div>
                      </div>
                    </div>
                    
                    <div className="stat-card bookings">
                      <div className="stat-icon">📸</div>
                      <div className="stat-content">
                        <div className="stat-value">{calculateRevenue().confirmedCount}</div>
                        <div className="stat-label">Confirmed Sessions</div>
                      </div>
                    </div>
                    
                    <div className="stat-card pending">
                      <div className="stat-icon">⏳</div>
                      <div className="stat-content">
                        <div className="stat-value">{bookings.filter(b => b.status === 'held').length}</div>
                        <div className="stat-label">Pending Bookings</div>
                      </div>
                    </div>
                  </div>

                  <div className="recent-bookings">
                    <div className="section-header">
                      <h3 className="section-title">Recent Bookings</h3>
                      <button
                        onClick={exportBookingsCSV}
                        className="export-button"
                      >
                        📥 Export CSV
                      </button>
                    </div>

                    <div className="bookings-table">
                      {bookings.length === 0 ? (
                        <div className="no-bookings">
                          <div className="no-bookings-icon">📝</div>
                          <h4>No bookings yet</h4>
                          <p>New bookings will appear here once clients start booking sessions.</p>
                        </div>
                      ) : (
                        <div className="bookings-list">
                          {bookings.slice(0, 5).map((booking) => (
                            <div key={booking.id} className="booking-item">
                              <div className="booking-main">
                                <div className="booking-client">
                                  <strong>{booking.clientName}</strong>
                                  <span className="booking-email">{booking.email}</span>
                                </div>
                                <div className="booking-details">
                                  <span className="booking-package">{booking.package}</span>
                                  <span className="booking-date">{booking.date} at {booking.time}</span>
                                </div>
                                <div className="booking-price">${booking.totalPrice}</div>
                                <div className="booking-status">
                                  <span className={`status-badge ${booking.status}`}>{booking.status}</span>
                                  <span className={`payment-badge ${booking.paymentStatus}`}>{booking.paymentStatus}</span>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Enhanced Bookings Management with HST and Invoices */}
            {adminCurrentTab === 'bookings' && (
              <div className="admin-content">
                <div className="bookings-management">
                  <h2 className="admin-section-title">Bookings Management</h2>
                  
                  <div className="bookings-actions">
                    <button
                      onClick={exportBookingsCSV}
                      className="action-button primary"
                    >
                      📥 Export All Bookings
                    </button>
                    <button
                      onClick={() => {
                        const hstReport = bookings.map(booking => {
                          const hst = calculateHST(booking.totalPrice);
                          return {
                            client: booking.clientName,
                            date: booking.date,
                            subtotal: hst.subtotal,
                            hst: hst.hst,
                            total: hst.total
                          };
                        });
                        console.log('HST Report:', hstReport);
                        alert('HST report generated! Check console for details.');
                      }}
                      className="action-button secondary"
                    >
                      📊 HST Report
                    </button>
                  </div>

                  <div className="bookings-table detailed">
                    {bookings.length === 0 ? (
                      <div className="no-bookings">
                        <div className="no-bookings-icon">📝</div>
                        <h4>No bookings yet</h4>
                        <p>New bookings will appear here once clients start booking sessions.</p>
                      </div>
                    ) : (
                      <div className="bookings-list detailed">
                        {bookings.map((booking) => {
                          const hstBreakdown = calculateHSTBreakdown(booking.totalPrice); // ✅ NEW - USE THIS
                          return (
                            <div key={booking.id} className="booking-card">
                              <div className="booking-card-header">
                                <div className="booking-card-client">
                                  <h4>{booking.clientName}</h4>
                                  <div className="client-details">
                                    <span>📧 {booking.email}</span>
                                    <span>📱 {booking.phone}</span>
                                    {booking.birthday && <span>🎂 {booking.birthday}</span>}
                                  </div>
                                </div>
                                <div className="booking-card-status">
                                  <span className={`status-badge large ${booking.status}`}>{booking.status}</span>
                                  <span className={`payment-badge large ${booking.paymentStatus}`}>{booking.paymentStatus}</span>
                                  {booking.invoiceSent && <span className="invoice-badge">📧 Invoice Sent</span>}
                                </div>
                              </div>

                              <div className="booking-card-content">
                                <div className="booking-info-grid">
                                  <div className="info-item">
                                    <span className="info-label">Package:</span>
                                    <span className="info-value">{booking.package}</span>
                                  </div>
                                  <div className="info-item">
                                    <span className="info-label">Date & Time:</span>
                                    <span className="info-value">{booking.date} at {booking.time}</span>
                                  </div>
                                  <div className="info-item">
                                    <span className="info-label">Duration:</span>
                                    <span className="info-value">{booking.duration}</span>
                                  </div>
                                  
                                  {/* ✅ CORRECT HST BREAKDOWN - NO EXTRA CHARGES */}
                                  <div className="info-item">
                                    <span className="info-label">Service Amount:</span>
                                    <span className="info-value price">${hstBreakdown.serviceAmount}</span>
                                  </div>
                                  <div className="info-item">
                                    <span className="info-label">HST (13%):</span>
                                    <span className="info-value hst">${hstBreakdown.hstAmount}</span>
                                  </div>
                                  <div className="info-item">
                                    <span className="info-label">Total:</span>
                                    <span className="info-value total">${hstBreakdown.total}</span>
                                  </div>
                                </div>

                                {booking.addons && booking.addons.length > 0 && (
                                  <div className="booking-addons">
                                    <h5>Add-ons:</h5>
                                    <div className="addons-list">
                                      {booking.addons.map((addon, index) => (
                                        <span key={index} className="addon-tag">
                                          {addon.name} (+${addon.price})
                                        </span>
                                      ))}
                                    </div>
                                  </div>
                                )}

                                {booking.discount && (
                                  <div className="booking-discount">
                                    <span className="discount-tag">
                                      💰 {booking.discount.code}: {booking.discount.description}
                                    </span>
                                  </div>
                                )}
                              </div>

                              <div className="booking-card-actions">
                                {booking.status === 'held' && (
                                  <>
                                    <button
                                      onClick={() => confirmBookingWithInvoice(booking.id)}
                                      className="action-button confirm"
                                    >
                                      ✅ Confirm & Send Invoice
                                    </button>
                                    <button
                                      onClick={() => updateBookingStatus(booking.id, 'cancelled')}
                                      className="action-button cancel"
                                    >
                                      ❌ Cancel Booking
                                    </button>
                                  </>
                                )}
                                
                                {booking.status === 'confirmed' && booking.paymentStatus === 'pending' && (
                                  <button
                                    onClick={() => updateBookingStatus(booking.id, 'confirmed', 'paid')}
                                    className="action-button confirm"
                                  >
                                    💳 Mark as Paid
                                  </button>
                                )}

                                <button
                                  onClick={() => downloadInvoice(booking)}
                                  className="action-button invoice"
                                >
                                  📄 Download Invoice
                                </button>

                                <button
                                  onClick={() => emailInvoice(booking)}
                                  className="action-button email"
                                >
                                  📧 Email Invoice
                                </button>

                                <button
                                  onClick={() => {
                                    const mailtoLink = `mailto:${booking.email}?subject=Your Peridot Images Session - ${booking.date}&body=Hi ${booking.clientName},%0A%0AThank you for booking with Peridot Images!%0A%0ASession Details:%0ADate: ${booking.date}%0ATime: ${booking.time}%0APackage: ${booking.package}%0ALocation: Barrhaven Studio, Ottawa%0A%0AWe look forward to creating beautiful memories with you!%0A%0ABest regards,%0APeridot Images Team`;
                                    window.location.href = mailtoLink;
                                  }}
                                  className="action-button email"
                                >
                                  📧 Email Client
                                </button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Calendar Management */}
            {adminCurrentTab === 'calendar' && (
              <div className="admin-content">
                <div className="calendar-management-section">
                  <h2 className="admin-section-title">Calendar Management</h2>
                  <p className="section-description">Manage your availability, view bookings, and control your schedule</p>
                  
                  <div className="calendar-controls">
                    <div className="calendar-view-toggle">
                      <button
                        onClick={() => setCalendarView('year')}
                        className={`view-toggle-btn ${calendarView === 'year' ? 'active' : ''}`}
                      >
                        📅 Year View
                      </button>
                      <button
                        onClick={() => setCalendarView('month')}
                        className={`view-toggle-btn ${calendarView === 'month' ? 'active' : ''}`}
                      >
                        🗓️ Month View
                      </button>
                      <button
                        onClick={() => setCalendarView('week')}
                        className={`view-toggle-btn ${calendarView === 'week' ? 'active' : ''}`}
                      >
                        📋 Week View
                      </button>
                    </div>
                    
                    <div className="calendar-legend">
                      <div className="legend-item available">
                        <span className="legend-dot"></span>
                        Available
                      </div>
                      <div className="legend-item booked">
                        <span className="legend-dot"></span>
                        Real Bookings
                      </div>
                      <div className="legend-item blocked">
                        <span className="legend-dot"></span>
                        Blocked/Fake
                      </div>
                    </div>
                  </div>

                  {/* YEAR VIEW - Enhanced with real booking display */}
                  {calendarView === 'year' && (
                    <div className="famwall-calendar">
                      <div className="calendar-year-grid">
                        {generateYearCalendar().map((month, monthIndex) => (
                          <div key={monthIndex} className="famwall-month-block">
                            <div className="month-header">
                              <h3 className="month-title">{month.name}</h3>
                              <div className="month-stats">
                                <span className="available-count">
                                  {month.dates.filter(d => !d.isBlocked && !d.hasBooking).length} available
                                </span>
                                <span className="booked-count">
                                  {month.dates.filter(d => d.hasBooking).length} booked
                                </span>
                                <span className="blocked-count">
                                  {month.dates.filter(d => d.isBlocked).length} blocked
                                </span>
                              </div>
                            </div>
                            
                            <div className="month-dates-grid">
                              {month.dates.map((dateObj) => {
                                const dayBookings = getBookingsForDate(dateObj.date);
                                const hasRealBooking = dayBookings.length > 0;
                                
                                return (
                                  <div
                                    key={dateObj.date}
                                    className={`famwall-date-card ${
                                      hasRealBooking ? 'booked' : 
                                      dateObj.isBlocked ? 'blocked' : 'available'
                                    }`}
                                    onClick={() => setSelectedDate(dateObj.date)}
                                  >
                                    <div className="date-number">{dateObj.day}</div>
                                    <div className="date-day">{dateObj.dayName}</div>
                                    
                                    {hasRealBooking && (
                                      <div className="booking-indicator">{dayBookings.length}</div>
                                    )}
                                    
                                    {hasRealBooking && (
                                      <div className="booking-preview">
                                        {dayBookings.slice(0, 2).map((booking, idx) => (
                                          <div key={idx} className="mini-booking">
                                            {booking.time} - {booking.clientName.split(' ')[0]}
                                          </div>
                                        ))}
                                        {dayBookings.length > 2 && (
                                          <div className="more-bookings">+{dayBookings.length - 2} more</div>
                                        )}
                                      </div>
                                    )}
                                    
                                    <button
                                      className="quick-block-btn"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        toggleDateBlock(dateObj.date);
                                      }}
                                    >
                                      {dateObj.isBlocked ? '🔓' : '🔒'}
                                    </button>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* MONTH VIEW - Focused single month */}
                  {calendarView === 'month' && (
                    <div className="month-view-container">
                      <div className="month-navigation">
                        <button
                          onClick={() => setCurrentMonth(Math.max(0, currentMonth - 1))}
                          disabled={currentMonth === 0}
                          className={`month-nav-btn ${currentMonth === 0 ? 'disabled' : ''}`}
                        >
                          ← Previous Month
                        </button>
                        
                        <h3 className="current-month-title">
                          {monthlyCalendar[currentMonth]?.name}
                        </h3>
                        
                        <button
                          onClick={() => setCurrentMonth(Math.min(monthlyCalendar.length - 1, currentMonth + 1))}
                          disabled={currentMonth === monthlyCalendar.length - 1}
                          className={`month-nav-btn ${currentMonth === monthlyCalendar.length - 1 ? 'disabled' : ''}`}
                        >
                          Next Month →
                        </button>
                      </div>

                      <div className="single-month-view">
                        <div className="month-dates-section">
                          <h4 className="section-title">
                            Available Weekend Dates - {monthlyCalendar[currentMonth]?.dates.length || 0} dates
                          </h4>
                          
                          <div className="enhanced-dates-grid">
                            {monthlyCalendar[currentMonth]?.dates.map((dateObj) => {
                              const dayBookings = getBookingsForDate(dateObj.date);
                              const isBlocked = blockedDates.includes(dateObj.date);
                              
                              return (
                                <div
                                  key={dateObj.date}
                                  onClick={() => setSelectedDate(dateObj.date)}
                                  className={`enhanced-date-card ${
                                    selectedDate === dateObj.date ? 'selected' : ''
                                  } ${
                                    dayBookings.length > 0 ? 'has-bookings' : 
                                    isBlocked ? 'blocked' : 'available'
                                  }`}
                                >
                                  <div className="date-number">{dateObj.day}</div>
                                  <div className="date-day-name">{dateObj.dayName}</div>
                                  
                                  {dayBookings.length > 0 && (
                                    <div className="bookings-summary">
                                      <div className="booking-count">{dayBookings.length} booking{dayBookings.length > 1 ? 's' : ''}</div>
                                      {dayBookings.map((booking, idx) => (
                                        <div key={idx} className="booking-item">
                                          <strong>{booking.time}</strong>
                                          <span>{booking.clientName}</span>
                                        </div>
                                      ))}
                                    </div>
                                  )}
                                  
                                  {isBlocked && dayBookings.length === 0 && (
                                    <div className="blocked-indicator">🔒 Blocked</div>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* WEEK VIEW - Google Calendar Style */}
                  {calendarView === 'week' && (
                    <div className="week-view-container">
                      <div className="week-navigation">
                        <button
                          onClick={() => {
                            const newWeekStart = new Date(getCurrentWeekStart());
                            newWeekStart.setDate(newWeekStart.getDate() - 7);
                            // You can add week navigation state if needed
                          }}
                          className="week-nav-btn"
                        >
                          ← Previous Week
                        </button>
                        
                        <h3 className="current-week-title">
                          Week of {getCurrentWeekStart().toLocaleDateString('en-US', { 
                            month: 'long', 
                            day: 'numeric',
                            year: 'numeric'
                          })}
                        </h3>
                        
                        <button
                          onClick={() => {
                            const newWeekStart = new Date(getCurrentWeekStart());
                            newWeekStart.setDate(newWeekStart.getDate() + 7);
                            // You can add week navigation state if needed
                          }}
                          className="week-nav-btn"
                        >
                          Next Week →
                        </button>
                      </div>

                      <div className="week-grid">
                        <div className="time-column">
                          <div className="time-header">Time</div>
                          {['9:00 AM', '10:00 AM', '11:00 AM', '12:00 PM', '1:00 PM', '2:00 PM', '3:00 PM', '4:00 PM', '5:00 PM', '6:00 PM'].map(time => (
                            <div key={time} className="time-slot">{time}</div>
                          ))}
                        </div>
                        
                        {generateWeekView(getCurrentWeekStart()).map((day) => (
                          <div key={day.date} className="day-column">
                            <div className="day-header">
                              <div className="day-name">{day.dayName}</div>
                              <div className="day-number">{day.dayNumber}</div>
                              <div className="day-status">
                                {day.bookings.length > 0 ? `${day.bookings.length} booked` : 'Available'}
                              </div>
                            </div>
                            
                            <div className="day-time-slots">
                              {day.timeSlots.map((slot) => (
                                <div
                                  key={slot.time}
                                  className={`week-time-slot ${slot.status}`}
                                  onClick={() => setSelectedDate(day.date)}
                                >
                                  {slot.booking && (
                                    <div className="week-booking">
                                      <div className="booking-client">{slot.booking.clientName}</div>
                                      <div className="booking-package">{slot.booking.package}</div>
                                      <div className="booking-phone">{slot.booking.phone}</div>
                                    </div>
                                  )}
                                  
                                  {slot.status === 'blocked' && !slot.booking && (
                                    <div className="blocked-slot">
                                      <span>🔒 Blocked</span>
                                    </div>
                                  )}
                                  
                                  {slot.fakeBooking && (
                                    <div className="fake-booking-slot">
                                      <span>✨ {slot.fakeBooking.clientName}</span>
                                    </div>
                                  )}
                                </div>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {/* Time Slot Management Section */}
                  <div className="time-slot-management" style={{
                    background: 'rgba(255, 255, 255, 0.95)',
                    border: '2px solid rgba(245, 158, 11, 0.15)',
                    borderRadius: '20px',
                    padding: '24px',
                    marginTop: '32px',
                    boxShadow: '0 8px 25px rgba(0, 0, 0, 0.08)'
                  }}>
                    <h3 style={{
                      fontFamily: "'Playfair Display', serif",
                      fontSize: '1.5rem',
                      fontWeight: '700',
                      color: '#262626',
                      marginBottom: '20px',
                      borderBottom: '1px solid rgba(245, 158, 11, 0.15)',
                      paddingBottom: '16px'
                    }}>
                      ⏰ Time Slot Management
                    </h3>
                    
                    <div style={{marginBottom: '20px'}}>
                      <label style={{
                        display: 'block',
                        fontWeight: '600',
                        color: '#262626',
                        marginBottom: '8px'
                      }}>
                        Select Date for Time Management:
                      </label>
                      <input
                        type="date"
                        value={selectedDate}
                        onChange={(e) => setSelectedDate(e.target.value)}
                        style={{
                          padding: '12px 16px',
                          border: '2px solid rgba(245, 158, 11, 0.2)',
                          borderRadius: '12px',
                          fontSize: '1rem',
                          width: '200px',
                          background: 'rgba(255, 255, 255, 0.9)'
                        }}
                      />
                    </div>
                    
                    {selectedDate && (
                      <div className="time-slots-grid" style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
                        gap: '12px',
                        marginBottom: '20px'
                      }}>
                        {['9:00 AM', '10:00 AM', '11:00 AM', '12:00 PM', '1:00 PM', '2:00 PM', '3:00 PM', '4:00 PM', '5:00 PM', '6:00 PM'].map((time) => {
                          const isBlocked = blockedTimeSlots[selectedDate]?.includes(time);
                          const realBooking = bookings.find(b => b.date === selectedDate && b.time === time && b.status !== 'cancelled');
                          const fakeBooking = fakeBookings[selectedDate]?.find(fb => fb.time === time);
                          
                          return (
                            <div
                              key={time}
                              className={`time-slot-card ${
                                realBooking ? 'has-real-booking' : 
                                isBlocked ? 'has-fake-booking' : ''
                              }`}
                              style={{
                                background: realBooking ? 'rgba(16, 185, 129, 0.05)' : 
                                          isBlocked ? 'rgba(239, 68, 68, 0.05)' : 'rgba(255, 255, 255, 0.9)',
                                border: realBooking ? '2px solid rgba(16, 185, 129, 0.3)' :
                                       isBlocked ? '2px solid rgba(239, 68, 68, 0.3)' : '2px solid rgba(245, 158, 11, 0.15)',
                                borderRadius: '12px',
                                padding: '16px',
                                textAlign: 'center',
                                position: 'relative',
                                transition: 'all 0.3s ease'
                              }}
                            >
                              <div style={{
                                fontSize: '1.1rem',
                                fontWeight: '600',
                                color: realBooking ? '#059669' : isBlocked ? '#dc2626' : '#262626',
                                marginBottom: '8px'
                              }}>
                                {time}
                              </div>
                              
                              {realBooking && (
                                <div className="booking-info real-booking">
                                  <span className="booking-badge real">Real Booking</span>
                                  <div style={{fontSize: '0.8rem', color: '#059669'}}>
                                    {realBooking.clientName}
                                  </div>
                                  <div style={{fontSize: '0.7rem', color: '#059669'}}>
                                    {realBooking.package}
                                  </div>
                                </div>
                              )}
                              
                              {isBlocked && !realBooking && (
                                <div className="booking-info fake-booking">
                                  <span className="booking-badge fake">Blocked</span>
                                  <div className="fake-note">Time slot unavailable</div>
                                </div>
                              )}
                              
                              {!realBooking && (
                                <div className="time-slot-controls">
                                  <button
                                    className={`time-block-btn ${isBlocked ? 'unblock' : ''}`}
                                    onClick={() => toggleTimeSlotBlock(selectedDate, time)}
                                    disabled={realBooking}
                                    title={realBooking ? 'Cannot block - has real booking' : isBlocked ? 'Unblock time slot' : 'Block time slot'}
                                  >
                                    {isBlocked ? '🔓' : '🔒'}
                                  </button>
                                  
                                  {!isBlocked && !realBooking && (
                                    <button
                                      className="fake-booking-btn"
                                      onClick={() => {
                                        addFakeBooking(selectedDate, time);
                                      }}
                                      title="Add fake booking for testing"
                                    >
                                      ✨
                                    </button>
                                  )}
                                  
                                  {fakeBooking && (
                                    <button
                                      className="fake-booking-btn remove"
                                      onClick={() => {
                                        removeFakeBooking(selectedDate, time);
                                      }}
                                      title="Remove fake booking"
                                    >
                                      🗑️
                                    </button>
                                  )}
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )}
                    
                    <div style={{
                      background: 'rgba(245, 158, 11, 0.05)',
                      border: '1px solid rgba(245, 158, 11, 0.2)',
                      borderRadius: '12px',
                      padding: '16px',
                      marginTop: '20px'
                    }}>
                      <h4 style={{color: '#d97706', marginBottom: '12px'}}>📋 Quick Actions</h4>
                      <div style={{display: 'flex', gap: '12px', flexWrap: 'wrap'}}>
                        <button
                          onClick={() => {
                            if (selectedDate) {
                              const times = ['9:00 AM', '10:00 AM', '11:00 AM', '12:00 PM', '1:00 PM', '2:00 PM', '3:00 PM', '4:00 PM', '5:00 PM', '6:00 PM'];
                              times.forEach(time => {
                                if (!bookings.some(b => b.date === selectedDate && b.time === time)) {
                                  toggleTimeSlotBlock(selectedDate, time);
                                }
                              });
                            }
                          }}
                          style={{
                            background: 'rgba(239, 68, 68, 0.1)',
                            color: '#dc2626',
                            border: '1px solid rgba(239, 68, 68, 0.3)',
                            padding: '8px 16px',
                            borderRadius: '8px',
                            cursor: 'pointer',
                            fontSize: '0.9rem'
                          }}
                        >
                          🔒 Block All Available Times
                        </button>
                        
                        <button
                          onClick={() => {
                            if (selectedDate) {
                              setBlockedTimeSlots(prev => {
                                const newSlots = { ...prev };
                                delete newSlots[selectedDate];
                                localStorage.setItem('peridotBlockedTimeSlots', JSON.stringify(newSlots));
                                return newSlots;
                              });
                            }
                          }}
                          style={{
                            background: 'rgba(16, 185, 129, 0.1)',
                            color: '#059669',
                            border: '1px solid rgba(16, 185, 129, 0.3)',
                            padding: '8px 16px',
                            borderRadius: '8px',
                            cursor: 'pointer',
                            fontSize: '0.9rem'
                          }}
                        >
                          🔓 Unblock All Times
                        </button>
                        
                        <button
                          onClick={() => {
                            if (selectedDate) {
                              setFakeBookings(prev => {
                                const newBookings = { ...prev };
                                delete newBookings[selectedDate];
                                localStorage.setItem('peridotFakeBookings', JSON.stringify(newBookings));
                                return newBookings;
                              });
                            }
                          }}
                          style={{
                            background: 'rgba(139, 92, 246, 0.1)',
                            color: '#7c3aed',
                            border: '1px solid rgba(139, 92, 246, 0.3)',
                            padding: '8px 16px',
                            borderRadius: '8px',
                            cursor: 'pointer',
                            fontSize: '0.9rem'
                          }}
                        >
                          🗑️ Clear Fake Bookings
                        </button>
                      </div>
                    </div>
                  </div>
                  
                  {/* DEBUG & TEST SECTION */}
                  <div className="debug-section" style={{
                    background: 'rgba(59, 130, 246, 0.1)', 
                    border: '1px solid rgba(59, 130, 246, 0.2)', 
                    borderRadius: '12px', 
                    padding: '16px', 
                    marginTop: '20px'
                  }}>
                    <h5 style={{color: '#1d4ed8', marginBottom: '12px'}}>🔧 Debug & Test Area</h5>
                    <div style={{fontSize: '0.8rem', color: '#1d4ed8'}}>
                      <p><strong>Selected Date:</strong> {selectedDate}</p>
                      <p><strong>Blocked Dates:</strong> {JSON.stringify(blockedDates)}</p>
                      <p><strong>Blocked Time Slots:</strong> {JSON.stringify(blockedTimeSlots)}</p>
                      <p><strong>Fake Bookings:</strong> {JSON.stringify(fakeBookings)}</p>
                      <p><strong>Weekdays Enabled:</strong> {weekdaysEnabled ? 'YES' : 'NO'}</p>
                    </div>
                    
                    <div style={{marginTop: '12px'}}>
                      <button
                        onClick={() => {
                          console.log('=== MANUAL TEST ===');
                          console.log('Date:', selectedDate);
                          console.log('Time: 2:00 PM');
                          console.log('Before toggle:', blockedTimeSlots);
                          toggleTimeSlotBlock(selectedDate, '2:00 PM');
                        }}
                        style={{
                          background: '#1d4ed8',
                          color: 'white',
                          border: 'none',
                          padding: '8px 16px',
                          borderRadius: '8px',
                          cursor: 'pointer',
                          marginRight: '8px'
                        }}
                      >
                        🧪 Test Block 2:00 PM
                      </button>
                      
                      <button
                        onClick={() => {
                          console.log('=== CLEAR TEST ===');
                          setBlockedTimeSlots({});
                          setFakeBookings({});
                          localStorage.removeItem('peridotBlockedTimeSlots');
                          localStorage.removeItem('peridotFakeBookings');
                          alert('Cleared all time blocks and fake bookings!');
                        }}
                        style={{
                          background: '#ef4444',
                          color: 'white',
                          border: 'none',
                          padding: '8px 16px',
                          borderRadius: '8px',
                          cursor: 'pointer'
                        }}
                      >
                        🗑️ Clear All
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Analytics */}
            {adminCurrentTab === 'analytics' && (
              <div className="admin-content">
                <div className="analytics-section">
                  <h2 className="admin-section-title">Business Analytics</h2>
                  
                  <div className="analytics-grid">
                    <div className="analytics-card">
                      <h3>💰 Revenue Breakdown</h3>
                      <div className="revenue-details">
                        <div className="revenue-item">
                          <span>Total Revenue:</span>
                          <span className="revenue-amount">${calculateRevenue().totalRevenue}</span>
                        </div>
                        <div className="revenue-item">
                          <span>This Month:</span>
                          <span className="revenue-amount">${calculateRevenue().monthlyRevenue}</span>
                        </div>
                        <div className="revenue-item">
                          <span>Average per Session:</span>
                          <span className="revenue-amount">
                            ${calculateRevenue().confirmedCount > 0 ? 
                              Math.round(calculateRevenue().totalRevenue / calculateRevenue().confirmedCount) : 0}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="analytics-card">
                      <h3>📊 Session Types</h3>
                      <div className="session-breakdown">
                        {Object.entries(
                          bookings
                            .filter(b => b.status === 'confirmed')
                            .reduce((acc, booking) => {
                              acc[booking.package] = (acc[booking.package] || 0) + 1;
                              return acc;
                            }, {})
                        ).map(([packageName, count]) => (
                          <div key={packageName} className="session-type">
                            <span className="package-name">{packageName}</span>
                            <span className="package-count">{count} sessions</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="analytics-card">
                      <h3>📈 Business Insights</h3>
                      <div className="insights-list">
                        <div className="insight-item">
                          <span className="insight-icon">📅</span>
                          <span>Total bookings: {bookings.length}</span>
                        </div>
                        <div className="insight-item">
                          <span className="insight-icon">✅</span>
                          <span>Confirmation rate: {bookings.length > 0 ? Math.round((bookings.filter(b => b.status === 'confirmed').length / bookings.length) * 100) : 0}%</span>
                        </div>
                        <div className="insight-item">
                          <span className="insight-icon">💳</span>
                          <span>Payment completion: {bookings.length > 0 ? Math.round((bookings.filter(b => b.paymentStatus === 'paid').length / bookings.length) * 100) : 0}%</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* HST Calculator Tab */}
            {adminCurrentTab === 'hst' && (
              <div className="admin-content">
                <div className="hst-calculator-section" style={{maxWidth: 1200, margin: '0 auto'}}>
                  <h2 className="admin-section-title" style={{fontFamily: 'Playfair Display, serif', fontSize: '2rem', fontWeight: 700, color: '#262626', marginBottom: 8}}>HST Calculator & Reports</h2>
                  <p className="section-description" style={{color: '#525252', fontSize: '1.1rem', marginBottom: 32}}>Generate HST reports for CRA tax filings and compare months</p>
                  {(() => {
                    const months = [
                      'January', 'February', 'March', 'April', 'May', 'June',
                      'July', 'August', 'September', 'October', 'November', 'December'
                    ];
                    // Current and previous month reports
                    const currentHSTReport = calculateMonthlyHSTReport(bookings);
                    const prevMonth = hstSelectedMonth === 0 ? 11 : hstSelectedMonth - 1;
                    const prevYear = hstSelectedMonth === 0 ? hstSelectedYear - 1 : hstSelectedYear;
                    const prevHSTReport = calculateMonthlyHST(bookings, prevMonth, prevYear);
                    // Comparison helpers
                    const compare = (curr, prev) => prev === 0 ? 'N/A' : ((curr - prev) >= 0 ? '+' : '') + (curr - prev).toFixed(2);
                    return (
                      <div className="hst-dashboard" style={{display: 'flex', flexDirection: 'column', gap: 32}}>
                        {/* Month Selector & Comparison */}
                        <div style={{display: 'flex', gap: 24, alignItems: 'center', marginBottom: 24}}>
                          <div style={{background: '#fff', borderRadius: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.06)', padding: 24, flex: 1}}>
                            <h3 style={{marginBottom: 12, color: '#f59e0b'}}>📅 Select Month</h3>
                            <div style={{display: 'flex', gap: 12, alignItems: 'center'}}>
                              <select value={hstSelectedMonth} onChange={e => setHstSelectedMonth(Number(e.target.value))} style={{padding: 8, borderRadius: 8, border: '1px solid #e2e8f0'}}>
                                {months.map((m, i) => <option key={i} value={i}>{m}</option>)}
                              </select>
                              <input type="number" value={hstSelectedYear} min="2020" max={new Date().getFullYear()} onChange={e => setHstSelectedYear(Number(e.target.value))} style={{padding: 8, borderRadius: 8, border: '1px solid #e2e8f0', width: 90}} />
                            </div>
                          </div>
                          <div style={{background: '#fff', borderRadius: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.06)', padding: 24, flex: 2}}>
                            <h3 style={{marginBottom: 12, color: '#10b981'}}>📊 Month Comparison</h3>
                            <div style={{display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16}}>
                              <div>
                                <div style={{fontWeight: 600}}>Revenue</div>
                                <div style={{fontSize: '1.2rem', color: '#262626'}}>${currentHSTReport.totalRevenue}</div>
                                <div style={{fontSize: '0.9rem', color: '#888'}}>vs prev: {prevHSTReport ? compare(currentHSTReport.totalRevenue, prevHSTReport.totalRevenue) : 'N/A'}</div>
                              </div>
                              <div>
                                <div style={{fontWeight: 600}}>Service</div>
                                <div style={{fontSize: '1.2rem', color: '#262626'}}>${currentHSTReport.totalServiceAmount}</div>
                                <div style={{fontSize: '0.9rem', color: '#888'}}>vs prev: {prevHSTReport ? compare(currentHSTReport.totalServiceAmount, prevHSTReport.totalServiceAmount) : 'N/A'}</div>
                              </div>
                              <div>
                                <div style={{fontWeight: 600}}>HST</div>
                                <div style={{fontSize: '1.2rem', color: '#262626'}}>${currentHSTReport.totalHST}</div>
                                <div style={{fontSize: '0.9rem', color: '#888'}}>vs prev: {prevHSTReport ? compare(currentHSTReport.totalHST, prevHSTReport.totalHST) : 'N/A'}</div>
                              </div>
                              <div>
                                <div style={{fontWeight: 600}}>Sessions</div>
                                <div style={{fontSize: '1.2rem', color: '#262626'}}>{currentHSTReport.bookingCount}</div>
                                <div style={{fontSize: '0.9rem', color: '#888'}}>vs prev: {prevHSTReport ? compare(currentHSTReport.bookingCount, prevHSTReport.bookingCount) : 'N/A'}</div>
                              </div>
                            </div>
                          </div>
                        </div>
                        {/* Current Month HST Summary */}
                        <div className="hst-summary-card" style={{background: '#fff', borderRadius: 16, boxShadow: '0 4px 16px rgba(245,158,11,0.08)', padding: 32, marginBottom: 24}}>
                          <h3 className="hst-card-title" style={{color: '#f59e0b', fontSize: '1.3rem', marginBottom: 8}}>📊 Current Month HST Summary</h3>
                          <div className="hst-period" style={{color: '#888', marginBottom: 16}}>{currentHSTReport.month}</div>
                          <div className="hst-stats-grid" style={{display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 24, marginBottom: 16}}>
                            <div className="hst-stat" style={{textAlign: 'center'}}>
                              <div className="hst-stat-value" style={{fontSize: '1.5rem', fontWeight: 700, color: '#262626'}}>${currentHSTReport.totalRevenue}</div>
                              <div className="hst-stat-label" style={{color: '#888'}}>Total Revenue (HST Included)</div>
                            </div>
                            <div className="hst-stat" style={{textAlign: 'center'}}>
                              <div className="hst-stat-value" style={{fontSize: '1.5rem', fontWeight: 700, color: '#262626'}}>${currentHSTReport.totalServiceAmount}</div>
                              <div className="hst-stat-label" style={{color: '#888'}}>Service Amount</div>
                            </div>
                            <div className="hst-stat hst-collected" style={{textAlign: 'center'}}>
                              <div className="hst-stat-value" style={{fontSize: '1.5rem', fontWeight: 700, color: '#10b981'}}>${currentHSTReport.totalHST}</div>
                              <div className="hst-stat-label" style={{color: '#10b981'}}>HST Collected (13%)</div>
                            </div>
                            <div className="hst-stat" style={{textAlign: 'center'}}>
                              <div className="hst-stat-value" style={{fontSize: '1.5rem', fontWeight: 700, color: '#262626'}}>{currentHSTReport.bookingCount}</div>
                              <div className="hst-stat-label" style={{color: '#888'}}>Sessions Completed</div>
                            </div>
                          </div>
                          <div className="hst-actions" style={{textAlign: 'right'}}>
                            <button
                              onClick={() => exportHSTReport(bookings)}
                              className="hst-button primary"
                              style={{background: 'linear-gradient(135deg, #f59e0b, #d97706)', color: 'white', border: 'none', padding: '12px 24px', borderRadius: 8, fontWeight: 600, cursor: 'pointer', fontSize: '1rem'}}
                            >
                              📥 Export Current Month HST Report
                            </button>
                          </div>
                        </div>
                        {/* HST Calculation Tool */}
                        <div className="hst-calculator-card" style={{background: '#fff', borderRadius: 16, boxShadow: '0 4px 16px rgba(59,130,246,0.08)', padding: 32, marginBottom: 24}}>
                          <h3 className="hst-card-title" style={{color: '#3b82f6', fontSize: '1.2rem', marginBottom: 8}}>🧮 HST Calculator Tool</h3>
                          <p className="hst-card-description" style={{color: '#525252', marginBottom: 16}}>Calculate HST breakdown for any amount</p>
                          <div className="hst-calculator-tool">
                            <div className="hst-input-group" style={{marginBottom: 16}}>
                              <label className="hst-label" style={{fontWeight: 600, color: '#262626', marginBottom: 8, display: 'block'}}>Total Amount (HST Included):</label>
                              <input
                                type="number"
                                placeholder="Enter amount (e.g., 250)"
                                className="hst-input"
                                style={{width: '100%', padding: 12, border: '2px solid #f59e0b', borderRadius: 8, fontSize: '1rem'}}
                                onChange={(e) => {
                                  const amount = parseFloat(e.target.value) || 0;
                                  const breakdown = calculateHSTBreakdown(amount);
                                  const resultDiv = document.querySelector('.hst-calc-result');
                                  if (resultDiv && amount > 0) {
                                    resultDiv.innerHTML = `
                                      <div class='hst-breakdown-item' style='display:flex;justify-content:space-between;margin-bottom:8px;'><span>Service Amount:</span><span>$${breakdown.serviceAmount}</span></div>
                                      <div class='hst-breakdown-item' style='display:flex;justify-content:space-between;margin-bottom:8px;'><span>HST (13%):</span><span>$${breakdown.hstAmount}</span></div>
                                      <div class='hst-breakdown-item total' style='display:flex;justify-content:space-between;font-weight:700;color:#f59e0b;'><span>Total:</span><span>$${breakdown.total}</span></div>
                                    `;
                                    resultDiv.style.display = 'block';
                                  } else if (resultDiv) {
                                    resultDiv.style.display = 'none';
                                  }
                                }}
                              />
                            </div>
                            <div className="hst-calc-result" style={{display: 'none', background: '#fef7ed', border: '1px solid #f59e0b', borderRadius: 8, padding: 16, marginTop: 8}}>
                              {/* Results will be populated by the input handler */}
                            </div>
                          </div>
                        </div>
                        {/* HST Information */}
                        <div className="hst-info-card" style={{background: '#fff', borderRadius: 16, boxShadow: '0 4px 16px rgba(16,185,129,0.08)', padding: 32}}>
                          <h3 className="hst-card-title" style={{color: '#10b981', fontSize: '1.2rem', marginBottom: 8}}>ℹ️ HST Information</h3>
                          <div className="hst-info-grid" style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16}}>
                            <div className="hst-info-item" style={{background: '#f0fdf4', borderRadius: 8, padding: 16}}>
                              <h4 style={{color: '#3b82f6', marginBottom: 8}}>🇨🇦 Ontario HST Rate</h4>
                              <p style={{color: '#525252', margin: 0}}>13% Harmonized Sales Tax applies to all photography services in Ontario, Canada.</p>
                            </div>
                            <div className="hst-info-item" style={{background: '#fef7ed', borderRadius: 8, padding: 16}}>
                              <h4 style={{color: '#f59e0b', marginBottom: 8}}>💰 Pricing Structure</h4>
                              <p style={{color: '#525252', margin: 0}}>All quoted prices include HST. Clients pay the advertised amount with no additional charges.</p>
                            </div>
                            <div className="hst-info-item" style={{background: '#eff6ff', borderRadius: 8, padding: 16}}>
                              <h4 style={{color: '#3b82f6', marginBottom: 8}}>📊 CRA Reporting</h4>
                              <p style={{color: '#525252', margin: 0}}>Use the exported HST reports for your quarterly or annual CRA filings.</p>
                            </div>
                            <div className="hst-info-item" style={{background: '#f0fdf4', borderRadius: 8, padding: 16}}>
                              <h4 style={{color: '#10b981', marginBottom: 8}}>🧮 Calculation Method</h4>
                              <p style={{color: '#525252', margin: 0}}>Service Amount = Total Price ÷ 1.13<br/>HST Amount = Total Price - Service Amount</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })()}
                </div>
              </div>
            )}

            {/* Discounts Tab */}
            {adminCurrentTab === 'discounts' && (
              <div className="admin-content">
                <div className="discounts-management-section">
                  <h2 className="admin-section-title">Discount Code Manager</h2>
                  <p className="section-description">Create, manage, and track your promotional discount codes</p>
                  {/* Discount Statistics */}
                  <div className="discount-stats-grid">
                    {(() => {
                      const stats = calculateDiscountStats();
                      return (
                        <>
                          <div className="discount-stat-card">
                            <div className="stat-icon">🎫</div>
                            <div className="stat-content">
                              <div className="stat-value">{stats.totalCodes}</div>
                              <div className="stat-label">Total Codes</div>
                            </div>
                          </div>
                          <div className="discount-stat-card active">
                            <div className="stat-icon">✅</div>
                            <div className="stat-content">
                              <div className="stat-value">{stats.activeCodes}</div>
                              <div className="stat-label">Active Codes</div>
                            </div>
                          </div>
                          <div className="discount-stat-card usage">
                            <div className="stat-icon">📊</div>
                            <div className="stat-content">
                              <div className="stat-value">{stats.totalUsage}</div>
                              <div className="stat-label">Total Usage</div>
                            </div>
                          </div>
                          <div className="discount-stat-card expired">
                            <div className="stat-icon">⏰</div>
                            <div className="stat-content">
                              <div className="stat-value">{stats.expiredCodes}</div>
                              <div className="stat-label">Expired Codes</div>
                            </div>
                          </div>
                        </>
                      );
                    })()}
                  </div>
                  {/* Action Buttons */}
                  <div className="discount-actions">
                    <button
                      onClick={() => {
                        resetDiscountForm();
                        setEditingDiscount(null);
                        setShowDiscountForm(true);
                      }}
                      className="action-button primary"
                    >
                      ➕ Create New Discount Code
                    </button>
                    <button
                      onClick={exportDiscountReport}
                      className="action-button secondary"
                    >
                      📥 Export Discount Report
                    </button>
                  </div>
                  {/* Discount Form Modal */}
                  {showDiscountForm && (
                    <div className="discount-form-overlay">
                      <div className="discount-form-modal">
                        <div className="discount-form-header">
                          <h3 className="discount-form-title">
                            {editingDiscount ? 'Edit Discount Code' : 'Create New Discount Code'}
                          </h3>
                          <button
                            onClick={() => {
                              setShowDiscountForm(false);
                              setEditingDiscount(null);
                              resetDiscountForm();
                            }}
                            className="discount-form-close"
                          >
                            ✕
                          </button>
                        </div>
                        <div className="discount-form-content">
                          <div className="discount-form-grid">
                            <div className="discount-form-group">
                              <label className="discount-form-label">Discount Code *</label>
                              <input
                                type="text"
                                value={discountFormData.code}
                                onChange={(e) => setDiscountFormData({
                                  ...discountFormData, 
                                  code: e.target.value.toUpperCase()
                                })}
                                placeholder="e.g., SUMMER25"
                                className="discount-form-input"
                                maxLength={20}
                              />
                              <small className="discount-form-help">Use letters and numbers only</small>
                            </div>
                            <div className="discount-form-group">
                              <label className="discount-form-label">Discount Type *</label>
                              <select
                                value={discountFormData.type}
                                onChange={(e) => setDiscountFormData({
                                  ...discountFormData, 
                                  type: e.target.value
                                })}
                                className="discount-form-input"
                              >
                                <option value="percentage">Percentage (%)</option>
                                <option value="fixed">Fixed Amount ($)</option>
                              </select>
                            </div>
                            <div className="discount-form-group">
                              <label className="discount-form-label">
                                Discount Value * {discountFormData.type === 'percentage' ? '(%)' : '($)'}
                              </label>
                              <input
                                type="number"
                                value={discountFormData.value}
                                onChange={(e) => setDiscountFormData({
                                  ...discountFormData, 
                                  value: e.target.value
                                })}
                                placeholder={discountFormData.type === 'percentage' ? '10' : '50'}
                                min="0"
                                max={discountFormData.type === 'percentage' ? '100' : '1000'}
                                className="discount-form-input"
                              />
                            </div>
                            <div className="discount-form-group full-width">
                              <label className="discount-form-label">Description *</label>
                              <input
                                type="text"
                                value={discountFormData.description}
                                onChange={(e) => setDiscountFormData({
                                  ...discountFormData, 
                                  description: e.target.value
                                })}
                                placeholder="e.g., 25% off summer family sessions"
                                className="discount-form-input"
                                maxLength={100}
                              />
                              <small className="discount-form-help">This is what customers will see</small>
                            </div>
                            <div className="discount-form-group">
                              <label className="discount-form-label">Expiry Date</label>
                              <input
                                type="date"
                                value={discountFormData.expiryDate}
                                onChange={(e) => setDiscountFormData({
                                  ...discountFormData, 
                                  expiryDate: e.target.value
                                })}
                                min={new Date().toISOString().split('T')[0]}
                                className="discount-form-input"
                              />
                              <small className="discount-form-help">Leave empty for no expiry</small>
                            </div>
                            <div className="discount-form-group">
                              <label className="discount-form-label">Usage Limit</label>
                              <input
                                type="number"
                                value={discountFormData.usageLimit}
                                onChange={(e) => setDiscountFormData({
                                  ...discountFormData, 
                                  usageLimit: e.target.value
                                })}
                                placeholder="e.g., 50"
                                min="1"
                                className="discount-form-input"
                              />
                              <small className="discount-form-help">Maximum number of uses (leave empty for unlimited)</small>
                            </div>
                            <div className="discount-form-group full-width">
                              <div className="discount-form-checkbox">
                                <input
                                  type="checkbox"
                                  id="discountActive"
                                  checked={discountFormData.isActive}
                                  onChange={(e) => setDiscountFormData({
                                    ...discountFormData, 
                                    isActive: e.target.checked
                                  })}
                                  className="discount-checkbox"
                                />
                                <label htmlFor="discountActive" className="discount-checkbox-label">
                                  Active (customers can use this code)
                                </label>
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="discount-form-actions">
                          <button
                            onClick={() => {
                              setShowDiscountForm(false);
                              setEditingDiscount(null);
                              resetDiscountForm();
                            }}
                            className="discount-form-button secondary"
                          >
                            Cancel
                          </button>
                          <button
                            onClick={editingDiscount ? updateDiscountCode : createDiscountCode}
                            className="discount-form-button primary"
                          >
                            {editingDiscount ? 'Update Code' : 'Create Code'}
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                  {/* Discount Codes Table */}
                  <div className="discount-codes-section">
                    <h3 className="section-title">All Discount Codes</h3>
                    {discountCodes.length === 0 ? (
                      <div className="no-discounts">
                        <div className="no-discounts-icon">🎫</div>
                        <h4>No discount codes yet</h4>
                        <p>Create your first discount code to start offering promotions to your clients.</p>
                        <button
                          onClick={() => {
                            resetDiscountForm();
                            setShowDiscountForm(true);
                          }}
                          className="action-button primary"
                        >
                          Create Your First Discount Code
                        </button>
                      </div>
                    ) : (
                      <div className="discount-codes-table">
                        {discountCodes.map((discount) => {
                          const isExpired = discount.expiryDate && new Date(discount.expiryDate) < new Date();
                          const bookingsWithCode = getBookingsWithDiscount(discount.code);
                          const usageCount = bookingsWithCode.length;
                          return (
                            <div key={discount.id} className={`discount-code-card ${!discount.isActive ? 'inactive' : ''} ${isExpired ? 'expired' : ''}`}>
                              <div className="discount-code-header">
                                <div className="discount-code-main">
                                  <div className="discount-code-name">{discount.code}</div>
                                  <div className="discount-code-value">
                                    {discount.type === 'percentage' ? `${discount.value}% OFF` : `$${discount.value} OFF`}
                                  </div>
                                </div>
                                <div className="discount-code-status">
                                  <span className={`discount-status-badge ${discount.isActive && !isExpired ? 'active' : 'inactive'}`}>
                                    {isExpired ? 'Expired' : discount.isActive ? 'Active' : 'Inactive'}
                                  </span>
                                </div>
                              </div>
                              <div className="discount-code-details">
                                <p className="discount-description">{discount.description}</p>
                                <div className="discount-info-grid">
                                  <div className="discount-info-item">
                                    <span className="info-label">Usage:</span>
                                    <span className="info-value">
                                      {usageCount} {discount.usageLimit ? `/ ${discount.usageLimit}` : ''} times
                                    </span>
                                  </div>
                                  <div className="discount-info-item">
                                    <span className="info-label">Expiry:</span>
                                    <span className="info-value">
                                      {discount.expiryDate ? new Date(discount.expiryDate).toLocaleDateString() : 'No expiry'}
                                    </span>
                                  </div>
                                  <div className="discount-info-item">
                                    <span className="info-label">Created:</span>
                                    <span className="info-value">
                                      {new Date(discount.createdAt).toLocaleDateString()}
                                    </span>
                                  </div>
                                </div>
                                {bookingsWithCode.length > 0 && (
                                  <div className="discount-usage-details">
                                    <h5>Recent Usage:</h5>
                                    <div className="usage-list">
                                      {bookingsWithCode.slice(0, 3).map((booking, idx) => (
                                        <div key={idx} className="usage-item">
                                          <span className="usage-client">{booking.clientName}</span>
                                          <span className="usage-date">{new Date(booking.createdAt).toLocaleDateString()}</span>
                                          <span className="usage-amount">${booking.totalPrice}</span>
                                        </div>
                                      ))}
                                      {bookingsWithCode.length > 3 && (
                                        <div className="usage-more">+{bookingsWithCode.length - 3} more uses</div>
                                      )}
                                    </div>
                                  </div>
                                )}
                              </div>
                              <div className="discount-code-actions">
                                <button
                                  onClick={() => startEditingDiscount(discount)}
                                  className="discount-action-btn edit"
                                >
                                  ✏️ Edit
                                </button>
                                <button
                                  onClick={() => toggleDiscountStatus(discount.id)}
                                  className={`discount-action-btn ${discount.isActive ? 'deactivate' : 'activate'}`}
                                >
                                  {discount.isActive ? '⏸️ Deactivate' : '▶️ Activate'}
                                </button>
                                <button
                                  onClick={() => deleteDiscountCode(discount.id)}
                                  className="discount-action-btn delete"
                                >
                                  🗑️ Delete
                                </button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
            {/* Packages Tab */}
            {adminCurrentTab === 'packages' && (
              <div className="admin-content">
                <div className="packages-management-section">
                  <h2 className="admin-section-title">Package Manager</h2>
                  <p className="section-description">Add, edit, and organize your luxury photography packages and categories</p>
                  {/* Category Tabs */}
                  <div className="package-categories-tabs">
                    {Object.keys(localPackages).map((cat) => (
                      <button
                        key={cat}
                        className={`category-tab${selectedCategory === cat ? ' active' : ''}`}
                        onClick={() => setSelectedCategory(cat)}
                      >
                        {localCategoryNames[cat] || cat}
                        <span className="category-count">{localPackages[cat].length}</span>
                      </button>
                    ))}
                    <button
                      className="category-tab"
                      onClick={() => setShowCategoryForm(true)}
                      style={{ background: 'linear-gradient(135deg, #f59e0b, #d97706)', color: 'white', fontWeight: 700 }}
                    >
                      ➕ Add Category
                    </button>
                  </div>
                  {/* Category Form Modal */}
                  {showCategoryForm && (
                    <div className="package-form-overlay">
                      <div className="package-form-modal">
                        <div className="package-form-header">
                          <h3 className="package-form-title">Add New Category</h3>
                          <button className="package-form-close" onClick={() => setShowCategoryForm(false)}>✕</button>
                        </div>
                        <div className="package-form-content">
                          <div className="package-form-group">
                            <label className="package-form-label">Category Name *</label>
                            <input
                              type="text"
                              value={categoryFormData.name}
                              onChange={e => setCategoryFormData({ ...categoryFormData, name: e.target.value })}
                              className="package-form-input"
                              placeholder="e.g., Family, Headshots"
                            />
                          </div>
                          <div className="package-form-group">
                            <label className="package-form-label">Category Key *</label>
                            <input
                              type="text"
                              value={categoryFormData.key}
                              onChange={e => setCategoryFormData({ ...categoryFormData, key: e.target.value.replace(/\s+/g, '').toLowerCase() })}
                              className="package-form-input"
                              placeholder="e.g., family, headshots"
                            />
                          </div>
                        </div>
                        <div className="package-form-actions">
                          <button className="package-form-button secondary" onClick={() => setShowCategoryForm(false)}>Cancel</button>
                          <button className="package-form-button primary" onClick={addCategory}>Add Category</button>
                        </div>
                      </div>
                    </div>
                  )}
                  {/* Packages Display */}
                  <div className="packages-display-section">
                    <div className="packages-section-header">
                      <h3 className="packages-section-title">{localCategoryNames[selectedCategory] || selectedCategory || 'Select a Category'}</h3>
                      {selectedCategory && (
                        <button className="add-package-btn" onClick={() => { setEditingPackage(null); setPackageFormData({ name: '', price: '', duration: '', people: '', outfits: '', backdrops: '', images: '', location: '', special: '', note: '', isActive: true }); setShowPackageEditor(true); }}>➕ Add Package</button>
                      )}
                    </div>
                    {selectedCategory && localPackages[selectedCategory] && localPackages[selectedCategory].length === 0 && (
                      <div className="no-packages">
                        <div className="no-packages-icon">📦</div>
                        <h4>No packages in this category</h4>
                        <p>Add your first package to get started.</p>
                        <button className="add-package-btn" onClick={() => { setEditingPackage(null); setPackageFormData({ name: '', price: '', duration: '', people: '', outfits: '', backdrops: '', images: '', location: '', special: '', note: '', isActive: true }); setShowPackageEditor(true); }}>Add Package</button>
                      </div>
                    )}
                    {selectedCategory && localPackages[selectedCategory] && localPackages[selectedCategory].length > 0 && (
                      <div className="packages-grid">
                        {localPackages[selectedCategory].map(pkg => (
                          <div key={pkg.id} className={`package-card${pkg.isActive === false ? ' inactive' : ''}`}>
                            <div className="package-card-header">
                              <div className="package-name">{pkg.name}</div>
                              <div className="package-price">{typeof pkg.price === 'number' ? `$${pkg.price}` : pkg.price}</div>
                            </div>
                            <div className="package-details">
                              <div className="package-detail-item"><span className="detail-label">Duration:</span> <span className="detail-value">{pkg.duration}</span></div>
                              <div className="package-detail-item"><span className="detail-label">People:</span> <span className="detail-value">{pkg.people}</span></div>
                              <div className="package-detail-item"><span className="detail-label">Outfits:</span> <span className="detail-value">{pkg.outfits}</span></div>
                              <div className="package-detail-item"><span className="detail-label">Backdrops:</span> <span className="detail-value">{pkg.backdrops}</span></div>
                              <div className="package-detail-item"><span className="detail-label">Images:</span> <span className="detail-value">{pkg.images}</span></div>
                              <div className="package-detail-item"><span className="detail-label">Location:</span> <span className="detail-value">{pkg.location}</span></div>
                              {pkg.special && <div className="package-special"><span className="special-label">Special:</span> <span className="special-value">{pkg.special}</span></div>}
                              {pkg.note && <div className="package-note"><span className="note-label">Note:</span> <span className="note-value">{pkg.note}</span></div>}
                            </div>
                            <div className="package-actions">
                              <button className="package-action-btn edit" onClick={() => { setEditingPackage(pkg); setPackageFormData({ ...pkg }); setShowPackageEditor(true); }}>✏️ Edit</button>
                              <button className="package-action-btn duplicate" onClick={() => duplicatePackage(pkg)}>📋 Duplicate</button>
                              <button className={`package-action-btn ${pkg.isActive === false ? 'activate' : 'deactivate'}`} onClick={() => togglePackageStatus(pkg.id)}>{pkg.isActive === false ? '▶️ Activate' : '⏸️ Deactivate'}</button>
                              <button className="package-action-btn delete" onClick={() => deletePackage(pkg.id)}>🗑️ Delete</button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  {/* Package Editor Modal */}
                  {showPackageEditor && (
                    <div className="package-form-overlay">
                      <div className="package-form-modal">
                        <div className="package-form-header">
                          <h3 className="package-form-title">{editingPackage ? 'Edit Package' : 'Add New Package'}</h3>
                          <button className="package-form-close" onClick={() => { setShowPackageEditor(false); setEditingPackage(null); }}>✕</button>
                        </div>
                        <div className="package-form-content">
                          <div className="package-form-grid">
                            <div className="package-form-group">
                              <label className="package-form-label">Name *</label>
                              <input type="text" className="package-form-input" value={packageFormData.name} onChange={e => setPackageFormData({ ...packageFormData, name: e.target.value })} />
                            </div>
                            <div className="package-form-group">
                              <label className="package-form-label">Price *</label>
                              <input type="number" className="package-form-input" value={packageFormData.price} onChange={e => setPackageFormData({ ...packageFormData, price: e.target.value })} />
                            </div>
                            <div className="package-form-group">
                              <label className="package-form-label">Duration *</label>
                              <input type="text" className="package-form-input" value={packageFormData.duration} onChange={e => setPackageFormData({ ...packageFormData, duration: e.target.value })} />
                            </div>
                            <div className="package-form-group">
                              <label className="package-form-label">People *</label>
                              <input type="text" className="package-form-input" value={packageFormData.people} onChange={e => setPackageFormData({ ...packageFormData, people: e.target.value })} />
                            </div>
                            <div className="package-form-group">
                              <label className="package-form-label">Outfits *</label>
                              <input type="text" className="package-form-input" value={packageFormData.outfits} onChange={e => setPackageFormData({ ...packageFormData, outfits: e.target.value })} />
                            </div>
                            <div className="package-form-group">
                              <label className="package-form-label">Backdrops *</label>
                              <input type="text" className="package-form-input" value={packageFormData.backdrops} onChange={e => setPackageFormData({ ...packageFormData, backdrops: e.target.value })} />
                            </div>
                            <div className="package-form-group">
                              <label className="package-form-label">Images *</label>
                              <input type="text" className="package-form-input" value={packageFormData.images} onChange={e => setPackageFormData({ ...packageFormData, images: e.target.value })} />
                            </div>
                            <div className="package-form-group">
                              <label className="package-form-label">Location *</label>
                              <input type="text" className="package-form-input" value={packageFormData.location} onChange={e => setPackageFormData({ ...packageFormData, location: e.target.value })} />
                            </div>
                            <div className="package-form-group">
                              <label className="package-form-label">Special</label>
                              <input type="text" className="package-form-input" value={packageFormData.special} onChange={e => setPackageFormData({ ...packageFormData, special: e.target.value })} />
                            </div>
                            <div className="package-form-group">
                              <label className="package-form-label">Note</label>
                              <input type="text" className="package-form-input" value={packageFormData.note} onChange={e => setPackageFormData({ ...packageFormData, note: e.target.value })} />
                            </div>
                            <div className="package-form-group">
                              <label className="package-form-label">Active</label>
                              <input type="checkbox" checked={packageFormData.isActive !== false} onChange={e => setPackageFormData({ ...packageFormData, isActive: e.target.checked })} />
                            </div>
                          </div>
                        </div>
                        <div className="package-form-actions">
                          <button className="package-form-button secondary" onClick={() => { setShowPackageEditor(false); setEditingPackage(null); }}>Cancel</button>
                          <button className="package-form-button primary" onClick={editingPackage ? updatePackage : addPackage}>{editingPackage ? 'Update Package' : 'Add Package'}</button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
}

export default App;
