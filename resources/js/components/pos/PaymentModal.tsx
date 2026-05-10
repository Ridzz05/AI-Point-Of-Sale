import React, { useState } from 'react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    CreditCard,
    DollarSign,
    Smartphone,
    Building,
    Wallet,
    Plus,
    Minus,
    Trash,
    Check,
    X,
} from '@phosphor-icons/react';
import axios from 'axios';

interface PaymentModalProps {
    isOpen: boolean;
    onClose: () => void;
    cartSummary: {
        subtotal: number;
        tax: number;
        discount: number;
        total: number;
        item_count: number;
    };
    onSuccess: (order: any) => void;
}

interface Payment {
    method: 'cash' | 'card' | 'transfer' | 'ewallet' | 'credit' | 'other';
    amount: number;
    reference_number?: string;
}

const paymentMethods = [
    { value: 'cash', label: 'Cash', icon: DollarSign, color: 'green' },
    { value: 'card', label: 'Card', icon: CreditCard, color: 'blue' },
    { value: 'transfer', label: 'Transfer', icon: Building, color: 'purple' },
    { value: 'ewallet', label: 'E-Wallet', icon: Smartphone, color: 'orange' },
    { value: 'credit', label: 'Credit', icon: Wallet, color: 'red' },
];

export default function PaymentModal({ isOpen, onClose, cartSummary, onSuccess }: PaymentModalProps) {
    const [payments, setPayments] = useState<Payment[]>([
        { method: 'cash', amount: cartSummary.total }
    ]);
    const [customerInfo, setCustomerInfo] = useState({
        customer_id: null,
        customer_name: '',
        customer_phone: '',
        customer_email: '',
    });
    const [notes, setNotes] = useState('');
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState<any>({});

    const totalPaid = payments.reduce((sum, payment) => sum + payment.amount, 0);
    const change = totalPaid - cartSummary.total;
    const isPaidEnough = totalPaid >= cartSummary.total;

    const addPayment = () => {
        setPayments([...payments, { method: 'cash', amount: 0 }]);
    };

    const updatePayment = (index: number, field: keyof Payment, value: any) => {
        const updatedPayments = [...payments];
        updatedPayments[index] = { ...updatedPayments[index], [field]: value };
        setPayments(updatedPayments);
    };

    const removePayment = (index: number) => {
        if (payments.length > 1) {
            setPayments(payments.filter((_, i) => i !== index));
        }
    };

    const validateForm = () => {
        const newErrors: any = {};

        if (!isPaidEnough) {
            newErrors.payment = 'Insufficient payment amount';
        }

        payments.forEach((payment, index) => {
            if (payment.amount <= 0) {
                newErrors[`payment_${index}`] = 'Payment amount must be greater than 0';
            }
        });

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleCheckout = async () => {
        if (!validateForm()) return;

        try {
            setLoading(true);
            
            const response = await axios.post('/api/pos/checkout', {
                payments: payments,
                ...customerInfo,
                notes,
            });

            onSuccess(response.data.order);
            onClose();
        } catch (error: any) {
            console.error('Checkout failed:', error);
            setErrors(error.response?.data || { general: 'Checkout failed' });
        } finally {
            setLoading(false);
        }
    };

    const getPaymentIcon = (method: string) => {
        const paymentMethod = paymentMethods.find(pm => pm.value === method);
        const Icon = paymentMethod?.icon || DollarSign;
        return <Icon size={20} />;
    };

    const getPaymentLabel = (method: string) => {
        const paymentMethod = paymentMethods.find(pm => pm.value === method);
        return paymentMethod?.label || method;
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <CreditCard size={24} />
                        Payment & Checkout
                    </DialogTitle>
                </DialogHeader>

                <div className="space-y-6">
                    {/* Order Summary */}
                    <div className="bg-gray-50 p-4 rounded-lg">
                        <h3 className="font-semibold mb-3">Order Summary</h3>
                        <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                                <span>Items ({cartSummary.item_count})</span>
                                <span>IDR {cartSummary.subtotal.toLocaleString('id-ID')}</span>
                            </div>
                            <div className="flex justify-between">
                                <span>Tax</span>
                                <span>IDR {cartSummary.tax.toLocaleString('id-ID')}</span>
                            </div>
                            <div className="flex justify-between">
                                <span>Discount</span>
                                <span>IDR {cartSummary.discount.toLocaleString('id-ID')}</span>
                            </div>
                            <Separator />
                            <div className="flex justify-between font-bold text-lg">
                                <span>Total</span>
                                <span>IDR {cartSummary.total.toLocaleString('id-ID')}</span>
                            </div>
                        </div>
                    </div>

                    {/* Customer Information */}
                    <div>
                        <h3 className="font-semibold mb-3">Customer Information (Optional)</h3>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <Label htmlFor="customer_name">Name</Label>
                                <Input
                                    id="customer_name"
                                    value={customerInfo.customer_name}
                                    onChange={(e) => setCustomerInfo({ ...customerInfo, customer_name: e.target.value })}
                                    placeholder="Customer name"
                                />
                            </div>
                            <div>
                                <Label htmlFor="customer_phone">Phone</Label>
                                <Input
                                    id="customer_phone"
                                    value={customerInfo.customer_phone}
                                    onChange={(e) => setCustomerInfo({ ...customerInfo, customer_phone: e.target.value })}
                                    placeholder="Phone number"
                                />
                            </div>
                            <div className="col-span-2">
                                <Label htmlFor="customer_email">Email</Label>
                                <Input
                                    id="customer_email"
                                    type="email"
                                    value={customerInfo.customer_email}
                                    onChange={(e) => setCustomerInfo({ ...customerInfo, customer_email: e.target.value })}
                                    placeholder="Email address"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Payment Methods */}
                    <div>
                        <div className="flex items-center justify-between mb-3">
                            <h3 className="font-semibold">Payment Methods</h3>
                            <Button variant="outline" size="sm" onClick={addPayment}>
                                <Plus size={14} className="mr-1" />
                                Add Payment
                            </Button>
                        </div>

                        <div className="space-y-3">
                            {payments.map((payment, index) => (
                                <div key={index} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                                    <div className="flex items-center gap-2 flex-1">
                                        {getPaymentIcon(payment.method)}
                                        <Select
                                            value={payment.method}
                                            onValueChange={(value) => updatePayment(index, 'method', value)}
                                        >
                                            <SelectTrigger className="w-32">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {paymentMethods.map((method) => (
                                                    <SelectItem key={method.value} value={method.value}>
                                                        <div className="flex items-center gap-2">
                                                            <method.icon size={16} />
                                                            {method.label}
                                                        </div>
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <div className="flex items-center gap-2">
                                        <Label htmlFor={`amount_${index}`} className="text-sm">Amount:</Label>
                                        <Input
                                            id={`amount_${index}`}
                                            type="number"
                                            value={payment.amount}
                                            onChange={(e) => updatePayment(index, 'amount', parseFloat(e.target.value) || 0)}
                                            className="w-32"
                                            min="0"
                                            step="0.01"
                                        />
                                    </div>

                                    {(payment.method === 'card' || payment.method === 'transfer') && (
                                        <Input
                                            placeholder="Reference #"
                                            value={payment.reference_number || ''}
                                            onChange={(e) => updatePayment(index, 'reference_number', e.target.value)}
                                            className="w-32"
                                        />
                                    )}

                                    {payments.length > 1 && (
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => removePayment(index)}
                                        >
                                            <Trash size={14} />
                                        </Button>
                                    )}
                                </div>
                            ))}
                        </div>

                        {errors.payment && (
                            <p className="text-red-500 text-sm mt-2">{errors.payment}</p>
                        )}
                    </div>

                    {/* Payment Summary */}
                    <div className="bg-blue-50 p-4 rounded-lg">
                        <div className="space-y-2">
                            <div className="flex justify-between">
                                <span>Total Paid:</span>
                                <span className="font-semibold">
                                    IDR {totalPaid.toLocaleString('id-ID')}
                                </span>
                            </div>
                            <div className="flex justify-between">
                                <span>Required:</span>
                                <span>IDR {cartSummary.total.toLocaleString('id-ID')}</span>
                            </div>
                            {change > 0 && (
                                <div className="flex justify-between text-green-600 font-bold">
                                    <span>Change:</span>
                                    <span>IDR {change.toLocaleString('id-ID')}</span>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Notes */}
                    <div>
                        <Label htmlFor="notes">Order Notes</Label>
                        <Input
                            id="notes"
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            placeholder="Add any special notes..."
                        />
                    </div>

                    {/* Error Display */}
                    {errors.general && (
                        <div className="bg-red-50 text-red-600 p-3 rounded-lg">
                            {errors.general}
                        </div>
                    )}

                    {/* Action Buttons */}
                    <div className="flex gap-3 pt-4">
                        <Button
                            variant="outline"
                            onClick={onClose}
                            className="flex-1"
                            disabled={loading}
                        >
                            <X size={20} className="mr-2" />
                            Cancel
                        </Button>
                        <Button
                            onClick={handleCheckout}
                            className="flex-1"
                            disabled={loading || !isPaidEnough}
                        >
                            {loading ? (
                                'Processing...'
                            ) : (
                                <>
                                    <Check size={20} className="mr-2" />
                                    Complete Order
                                </>
                            )}
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}