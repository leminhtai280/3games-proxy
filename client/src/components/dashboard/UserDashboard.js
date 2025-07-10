import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Grid,
  Paper,
  Typography,
  Button,
  Card,
  CardContent,
  CardActions,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  CircularProgress,
  Chip,
} from '@mui/material';
import {
  AccountBalance,
  Payment,
  History,
  Add,
  Person,
  Email,
  Phone,
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';
import { paymentAPI, userAPI } from '../../services/api';

const UserDashboard = () => {
  const { user, updateUser } = useAuth();
  const [balance, setBalance] = useState(0);
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [paymentDialog, setPaymentDialog] = useState(false);
  const [paymentForm, setPaymentForm] = useState({
    amount: '',
    method: '',
    description: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      const [balanceRes, paymentsRes] = await Promise.all([
        userAPI.getBalance(),
        paymentAPI.getMyPayments(1, 5),
      ]);
      setBalance(balanceRes.data.balance);
      setPayments(paymentsRes.data.payments);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePaymentSubmit = async () => {
    if (!paymentForm.amount || !paymentForm.method) {
      setError('Vui lòng điền đầy đủ thông tin');
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      const response = await paymentAPI.createPayment(paymentForm);
      setPayments([response.data.payment, ...payments]);
      setPaymentDialog(false);
      setPaymentForm({ amount: '', method: '', description: '' });
      // Reload balance
      const balanceRes = await userAPI.getBalance();
      setBalance(balanceRes.data.balance);
    } catch (error) {
      setError(error.response?.data?.message || 'Tạo yêu cầu nạp tiền thất bại');
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return 'success';
      case 'pending':
        return 'warning';
      case 'failed':
        return 'error';
      default:
        return 'default';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'completed':
        return 'Hoàn thành';
      case 'pending':
        return 'Đang chờ';
      case 'failed':
        return 'Thất bại';
      default:
        return status;
    }
  };

  const getMethodText = (method) => {
    switch (method) {
      case 'bank_transfer':
        return 'Chuyển khoản ngân hàng';
      case 'credit_card':
        return 'Thẻ tín dụng';
      case 'paypal':
        return 'PayPal';
      case 'momo':
        return 'MoMo';
      case 'zalopay':
        return 'ZaloPay';
      default:
        return method;
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Grid container spacing={3}>
        {/* User Info Card */}
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column', height: 240 }}>
            <Box display="flex" alignItems="center" mb={2}>
              <Person sx={{ mr: 1 }} />
              <Typography variant="h6">Thông tin tài khoản</Typography>
            </Box>
            <Box mb={2}>
              <Typography variant="body2" color="text.secondary">
                Tên đăng nhập
              </Typography>
              <Typography variant="body1">{user?.username}</Typography>
            </Box>
            <Box mb={2}>
              <Typography variant="body2" color="text.secondary">
                Họ và tên
              </Typography>
              <Typography variant="body1">{user?.fullName}</Typography>
            </Box>
            <Box mb={2}>
              <Typography variant="body2" color="text.secondary">
                Email
              </Typography>
              <Typography variant="body1">{user?.email}</Typography>
            </Box>
            {user?.phone && (
              <Box>
                <Typography variant="body2" color="text.secondary">
                  Số điện thoại
                </Typography>
                <Typography variant="body1">{user.phone}</Typography>
              </Box>
            )}
          </Paper>
        </Grid>

        {/* Balance Card */}
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column', height: 240 }}>
            <Box display="flex" alignItems="center" mb={2}>
              <AccountBalance sx={{ mr: 1 }} />
              <Typography variant="h6">Số dư tài khoản</Typography>
            </Box>
            <Box flex={1} display="flex" alignItems="center" justifyContent="center">
              <Typography variant="h3" color="primary">
                {balance.toLocaleString('vi-VN')} ₫
              </Typography>
            </Box>
            <Button
              variant="contained"
              startIcon={<Add />}
              onClick={() => setPaymentDialog(true)}
              fullWidth
            >
              Nạp tiền
            </Button>
          </Paper>
        </Grid>

        {/* Quick Stats */}
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column', height: 240 }}>
            <Box display="flex" alignItems="center" mb={2}>
              <Payment sx={{ mr: 1 }} />
              <Typography variant="h6">Thống kê nhanh</Typography>
            </Box>
            <Box flex={1}>
              <Typography variant="body2" color="text.secondary">
                Tổng giao dịch
              </Typography>
              <Typography variant="h4">{payments.length}</Typography>
              <Box mt={2}>
                <Typography variant="body2" color="text.secondary">
                  Giao dịch gần đây
                </Typography>
                <Typography variant="body1">
                  {payments.filter(p => p.status === 'completed').length} hoàn thành
                </Typography>
              </Box>
            </Box>
          </Paper>
        </Grid>

        {/* Recent Payments */}
        <Grid item xs={12}>
          <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column' }}>
            <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
              <Box display="flex" alignItems="center">
                <History sx={{ mr: 1 }} />
                <Typography variant="h6">Giao dịch gần đây</Typography>
              </Box>
            </Box>
            {payments.length === 0 ? (
              <Typography variant="body2" color="text.secondary" textAlign="center" py={4}>
                Chưa có giao dịch nào
              </Typography>
            ) : (
              <Grid container spacing={2}>
                {payments.map((payment) => (
                  <Grid item xs={12} sm={6} md={4} key={payment._id}>
                    <Card>
                      <CardContent>
                        <Typography variant="h6" color="primary">
                          {payment.amount.toLocaleString('vi-VN')} ₫
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {getMethodText(payment.method)}
                        </Typography>
                        <Chip
                          label={getStatusText(payment.status)}
                          color={getStatusColor(payment.status)}
                          size="small"
                          sx={{ mt: 1 }}
                        />
                        <Typography variant="caption" display="block" mt={1}>
                          {new Date(payment.createdAt).toLocaleDateString('vi-VN')}
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            )}
          </Paper>
        </Grid>
      </Grid>

      {/* Payment Dialog */}
      <Dialog open={paymentDialog} onClose={() => setPaymentDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Tạo yêu cầu nạp tiền</DialogTitle>
        <DialogContent>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}
          <TextField
            autoFocus
            margin="dense"
            label="Số tiền (VNĐ)"
            type="number"
            fullWidth
            variant="outlined"
            value={paymentForm.amount}
            onChange={(e) => setPaymentForm({ ...paymentForm, amount: e.target.value })}
            sx={{ mb: 2 }}
          />
          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel>Phương thức thanh toán</InputLabel>
            <Select
              value={paymentForm.method}
              label="Phương thức thanh toán"
              onChange={(e) => setPaymentForm({ ...paymentForm, method: e.target.value })}
            >
              <MenuItem value="bank_transfer">Chuyển khoản ngân hàng</MenuItem>
              <MenuItem value="credit_card">Thẻ tín dụng</MenuItem>
              <MenuItem value="paypal">PayPal</MenuItem>
              <MenuItem value="momo">MoMo</MenuItem>
              <MenuItem value="zalopay">ZaloPay</MenuItem>
            </Select>
          </FormControl>
          <TextField
            margin="dense"
            label="Ghi chú (tùy chọn)"
            fullWidth
            variant="outlined"
            multiline
            rows={3}
            value={paymentForm.description}
            onChange={(e) => setPaymentForm({ ...paymentForm, description: e.target.value })}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPaymentDialog(false)}>Hủy</Button>
          <Button
            onClick={handlePaymentSubmit}
            variant="contained"
            disabled={submitting}
          >
            {submitting ? <CircularProgress size={20} /> : 'Tạo yêu cầu'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default UserDashboard;