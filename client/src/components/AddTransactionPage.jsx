import React, { useState, useEffect } from 'react';
import { ArrowLeft, Save, MapPin, DollarSign, Calendar as CalendarIcon, AlertCircle } from 'lucide-react';
import axios from 'axios';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card.jsx';
import { Button } from './ui/button.jsx';
import { Input } from './ui/input.jsx';
import { Label } from './ui/label.jsx';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select.jsx';
import { paymentMethods } from '../lib/constants.js';
import { cn } from '../lib/utils.js';
import { useNavigate } from 'react-router-dom';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { Calendar } from './ui/calendar';
import { format } from 'date-fns';

export function AddTransactionPage({ onNavigate, viewMode = 'family', user }) {
  const [formData, setFormData] = useState({
    type: 'expense',
    amount: '',
    description: '',
    categoryId: '',
    categoryName: '',
    paymentMethod: '',
    isPersonal: viewMode === 'personal',  // defaults based on viewMode
    notes: '',
    location: '',
    date: new Date(),
  });

  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [notificationSent, setNotificationSent] = useState(false);
  const [categories, setCategories] = useState([]);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const userHomeLocation = 'Dombivli, Maharashtra';

  // Sync isPersonal when viewMode updates (important for async user/viewMode changes)
  useEffect(() => {
    setFormData((prev) => ({ ...prev, isPersonal: viewMode === 'personal' }));
  }, [viewMode]);

  useEffect(() => {
    const fetchData = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('Authentication token not found. Please log in.');
        return;
      }
      try {
        const config = { headers: { 'Authorization': `Bearer ${token}` } };
        const categoriesRes = await axios.get('http://localhost:5000/api/categories', config);
        setCategories(categoriesRes.data);

        const defaultExpenseCat = categoriesRes.data.find(c => c.type === 'expense');
        if (defaultExpenseCat) {
          setFormData(prev => ({
            ...prev,
            categoryId: defaultExpenseCat.id,
            categoryName: defaultExpenseCat.name,
          }));
        }
      } catch (err) {
        console.error("Could not fetch initial data", err);
        setError('Failed to fetch initial data.');
      }
    };
    fetchData();
  }, []);

  // Detect location if cash payment and geolocation available
  useEffect(() => {
    if (formData.paymentMethod === 'cash' && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          const mockGeocodeUrl = `https://api.example.com/geocode?latlng=${latitude},${longitude}`;

          try {
            const res = await axios.get(mockGeocodeUrl);
            const currentLocation = res.data.results[0]?.formatted_address || 'Unknown Location';
            setFormData(prev => ({ ...prev, location: currentLocation }));

            if (currentLocation !== userHomeLocation && !notificationSent) {
              console.log('User is away from home. Sending a cash payment alert.');
              setNotificationSent(true);
            }
          } catch (error) {
            console.error("Geocoding failed:", error);
            setFormData(prev => ({ ...prev, location: 'Location detection failed' }));
          }
        },
        (error) => {
          console.log('Location access denied');
        }
      );
    } else {
      setFormData(prev => ({ ...prev, location: '' }));
    }
  }, [formData.paymentMethod, notificationSent]);

  const validateForm = () => {
    const newErrors = {};
    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      newErrors.amount = 'Please enter a valid amount';
    }
    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    }
    if (!formData.categoryId) {
      newErrors.categoryId = 'Please select a category';
    }
    if (!formData.paymentMethod) {
      newErrors.paymentMethod = 'Please select a payment method';
    }
    setError(null);
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsLoading(true);
    try {
      const token = localStorage.getItem('token');
      const config = { headers: { Authorization: `Bearer ${token}` } };

      const userIdToSend = user?.uid || user?.id || null;
      const familyIdToSend = formData.isPersonal ? null : (user?.familyId || null);

      const transactionData = {
        ...formData,
        amount: parseFloat(formData.amount),
        category: formData.categoryName,
        userId: userIdToSend,
        familyId: familyIdToSend,
        date: formData.date.toISOString(),
        isPersonal: !!formData.isPersonal,
      };

      console.log('Posting transactionData:', transactionData);

      await axios.post('http://localhost:5000/api/transactions', transactionData, config);
      onNavigate('transactions');
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.msg || 'Failed to save transaction. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field, value) => {
    if (field === 'category') {
      const selectedCategory = categories.find(cat => cat.id === value);
      setFormData(prev => ({
        ...prev,
        categoryId: value,
        categoryName: selectedCategory ? selectedCategory.name : '',
      }));
      if (errors.categoryId) setErrors(prev => ({ ...prev, categoryId: '' }));
    } else {
      setFormData(prev => ({ ...prev, [field]: value }));
      if (errors[field]) setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleTypeChange = (value) => {
    const newAvailableCategories = categories.filter(c => c.type === value);
    const newCategory = newAvailableCategories.length > 0 ? newAvailableCategories[0].id : '';
    const newCategoryName = newAvailableCategories.length > 0 ? newAvailableCategories[0].name : '';

    setFormData(prev => ({
      ...prev,
      type: value,
      categoryId: newCategory,
      categoryName: newCategoryName,
    }));
  };

  const availableCategories = categories.filter(c => c.type === formData.type) || [];
  const availablePaymentMethods = paymentMethods || [];

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onNavigate('dashboard')}
          className="gap-2 hover:bg-accent/80"
          style={{ fontSize: '12px', fontWeight: '500' }}
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </Button>
        <div className="space-y-1">
          <h1 style={{ fontSize: '28px', fontWeight: '700', lineHeight: '1.2' }} className="text-foreground">
            Add Transaction
          </h1>
          <p style={{ fontSize: '14px', lineHeight: '1.5' }} className="text-muted-foreground">
            Record a new {formData.type} transaction for your {viewMode} finances
          </p>
        </div>
      </div>

      {error && (
        <div className="bg-destructive/10 text-destructive border border-destructive/30 p-3 rounded-lg flex items-center gap-2">
          <AlertCircle className="w-4 h-4" />
          {error}
        </div>
      )}

      <div className="max-w-2xl">
        <Card className="shadow-sm hover:shadow-lg transition-all duration-300">
          <CardHeader className="pb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <DollarSign className="w-5 h-5 text-primary" />
              </div>
              <div>
                <CardTitle style={{ fontSize: '18px', fontWeight: '600' }}>Transaction Details</CardTitle>
                <CardDescription style={{ fontSize: '12px' }}>
                  Fill in the information about your transaction
                </CardDescription>
              </div>
            </div>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Transaction Type */}
              <div className="space-y-3">
                <Label style={{ fontSize: '12px', fontWeight: '500' }}>Transaction Type</Label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => handleTypeChange('expense')}
                    className={cn(
                      "p-4 rounded-xl border-2 transition-all duration-200 text-left",
                      formData.type === 'expense'
                        ? "border-red-500 bg-red-50 dark:bg-red-950/20"
                        : "border-border hover:border-red-300 hover:bg-red-50/50"
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-lg">
                        <span className="text-lg">💸</span>
                      </div>
                      <div>
                        <p style={{ fontSize: '12px', fontWeight: '600' }} className="text-foreground">Expense</p>
                        <p style={{ fontSize: '11px' }} className="text-muted-foreground">Money going out</p>
                      </div>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleTypeChange('income')}
                    className={cn(
                      "p-4 rounded-xl border-2 transition-all duration-200 text-left",
                      formData.type === 'income'
                        ? "border-emerald-500 bg-emerald-50 dark:bg-emerald-950/20"
                        : "border-border hover:border-emerald-300 hover:bg-emerald-50/50"
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg">
                        <span className="text-lg">💰</span>
                      </div>
                      <div>
                        <p style={{ fontSize: '12px', fontWeight: '600' }} className="text-foreground">Income</p>
                        <p style={{ fontSize: '11px' }} className="text-muted-foreground">Money coming in</p>
                      </div>
                    </div>
                  </button>
                </div>
              </div>

              {/* Amount */}
              <div className="space-y-2">
                <Label htmlFor="amount" style={{ fontSize: '12px', fontWeight: '500' }}>
                  Amount (₹)
                </Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground font-medium">
                    ₹
                  </span>
                  <Input
                    id="amount"
                    type="number"
                    placeholder="0.00"
                    value={formData.amount}
                    onChange={(e) => handleInputChange('amount', e.target.value)}
                    className={cn(
                      "pl-8 h-12",
                      errors.amount && 'border-destructive focus-visible:ring-destructive/20'
                    )}
                    style={{ fontSize: '14px', fontWeight: '500' }}
                    required
                  />
                </div>
                {errors.amount && (
                  <p style={{ fontSize: '11px' }} className="text-destructive flex items-center gap-1">
                    <span className="w-1 h-1 bg-destructive rounded-full"></span>
                    {errors.amount}
                  </p>
                )}
              </div>

              {/* Description */}
              <div className="space-y-2">
                <Label htmlFor="description" style={{ fontSize: '12px', fontWeight: '500' }}>
                  Description
                </Label>
                <Input
                  id="description"
                  placeholder="What was this transaction for?"
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  className={cn(
                    "h-12",
                    errors.description && 'border-destructive focus-visible:ring-destructive/20'
                  )}
                  style={{ fontSize: '12px' }}
                  required
                />
                {errors.description && (
                  <p style={{ fontSize: '11px' }} className="text-destructive flex items-center gap-1">
                    <span className="w-1 h-1 bg-destructive rounded-full"></span>
                    {errors.description}
                  </p>
                )}
              </div>

              {/* Date */}
              <div className="space-y-2">
                <Label htmlFor="date" style={{ fontSize: '12px', fontWeight: '500' }}>
                  Date
                </Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal h-12",
                        !formData.date && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {formData.date ? format(formData.date, "PPP") : <span>Pick a date</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={formData.date}
                      onSelect={(newDate) => {
                        if (newDate) handleInputChange('date', newDate);
                      }}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>

              {/* Category */}
              <div className="space-y-2">
                <Label style={{ fontSize: '12px', fontWeight: '500' }}>Category</Label>
                <Select
                  value={formData.categoryId}
                  onValueChange={(value) => handleInputChange('category', value)}
                  required
                >
                  <SelectTrigger
                    className={cn(
                      "h-12",
                      errors.categoryId && 'border-destructive focus-visible:ring-destructive/20'
                    )}
                    style={{ fontSize: '12px' }}
                  >
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableCategories.map((cat) => (
                      <SelectItem key={cat.id} value={cat.id}>
                        <div className="flex items-center gap-2">
                          <span>{cat.icon}</span>
                          <span>{cat.name}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.categoryId && (
                  <p style={{ fontSize: '11px' }} className="text-destructive flex items-center gap-1">
                    <span className="w-1 h-1 bg-destructive rounded-full"></span>
                    {errors.categoryId}
                  </p>
                )}
              </div>

              {/* Payment Method */}
              <div className="space-y-2">
                <Label style={{ fontSize: '12px', fontWeight: '500' }}>Payment Method</Label>
                <Select
                  value={formData.paymentMethod}
                  onValueChange={(value) => handleInputChange('paymentMethod', value)}
                  required
                >
                  <SelectTrigger
                    className={cn(
                      "h-12",
                      errors.paymentMethod && 'border-destructive focus-visible:ring-destructive/20'
                    )}
                    style={{ fontSize: '12px' }}
                  >
                    <SelectValue placeholder="How did you pay?" />
                  </SelectTrigger>
                  <SelectContent>
                    {availablePaymentMethods.map((method) => (
                      <SelectItem key={method.id} value={method.id}>
                        <div className="flex items-center gap-2">
                          <span>{method.icon}</span>
                          <div>
                            <div>{method.name}</div>
                            <div style={{ fontSize: '10px' }} className="text-muted-foreground">
                              {method.description}
                            </div>
                          </div>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.paymentMethod && (
                  <p style={{ fontSize: '11px' }} className="text-destructive flex items-center gap-1">
                    <span className="w-1 h-1 bg-destructive rounded-full"></span>
                    {errors.paymentMethod}
                  </p>
                )}
              </div>

              {/* Location (for cash payments) */}
              {formData.paymentMethod === 'cash' && (
                <div className="space-y-2">
                  <Label htmlFor="location" style={{ fontSize: '12px', fontWeight: '500' }}>
                    Location (Auto-detected)
                  </Label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="location"
                      placeholder="Location will be detected automatically"
                      value={formData.location}
                      onChange={(e) => handleInputChange('location', e.target.value)}
                      className="pl-9 h-12"
                      style={{ fontSize: '12px' }}
                    />
                  </div>
                  <p style={{ fontSize: '10px' }} className="text-muted-foreground flex items-center gap-1">
                    <span className="w-1 h-1 bg-blue-500 rounded-full"></span>
                    Location helps track cash spending patterns
                  </p>
                </div>
              )}

              {/* Notes */}
              <div className="space-y-2">
                <Label htmlFor="notes" style={{ fontSize: '12px', fontWeight: '500' }}>
                  Notes (Optional)
                </Label>
                <Input
                  id="notes"
                  placeholder="Add any additional notes..."
                  value={formData.notes}
                  onChange={(e) => handleInputChange('notes', e.target.value)}
                  className="h-12"
                  style={{ fontSize: '12px' }}
                />
              </div>

              {/* Personal/Family Toggle (only if user has family) */}
              {user?.familyId && (
                <div className="flex items-center space-x-3 p-4 bg-muted/20 rounded-xl">
                  <input
                    id="personal"
                    type="checkbox"
                    checked={formData.isPersonal}
                    onChange={(e) => handleInputChange('isPersonal', e.target.checked)}
                    className="w-4 h-4 text-primary border-border rounded focus:ring-primary focus:ring-2"
                  />
                  <div>
                    <Label
                      htmlFor="personal"
                      className="cursor-pointer"
                      style={{ fontSize: '12px', fontWeight: '500' }}
                    >
                      Personal expense
                    </Label>
                    <p style={{ fontSize: '11px' }} className="text-muted-foreground">
                      Check this if it's a personal expense not shared with family
                    </p>
                  </div>
                </div>
              )}

              {/* Submit Buttons */}
              <div className="flex gap-3 pt-4">
                <Button
                  type="submit"
                  disabled={isLoading}
                  className={cn(
                    "gap-2 h-12 px-6 bg-gradient-to-r",
                    formData.type === 'income'
                      ? "from-emerald-500 to-green-500 hover:from-emerald-600 hover:to-green-600"
                      : "from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600",
                    "text-white shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
                  )}
                  style={{ fontSize: '12px', fontWeight: '500' }}
                >
                  {isLoading ? (
                    <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                  ) : (
                    <Save className="w-4 h-4" />
                  )}
                  {isLoading ? 'Saving...' : `Save ${formData.type === 'income' ? 'Income' : 'Expense'}`}
                </Button>

                <Button
                  type="button"
                  variant="outline"
                  onClick={() => onNavigate('dashboard')}
                  className="h-12 px-6"
                  style={{ fontSize: '12px', fontWeight: '500' }}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}