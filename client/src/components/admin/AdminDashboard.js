import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Grid,
  Paper,
  Typography,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  CircularProgress,
  Button,
} from '@mui/material';
import {
  People,
  Payment,
  TrendingUp,
  AccountBalance,
  Visibility,
} from '@mui/icons-material';
import { adminAPI } from '../../services/api';

const AdminDashboard = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      const response = await adminAPI.getDashboard();
      setDashboardData(response.data);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
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
        return 'Chuyển khoản';
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

  if (!dashboardData) {
    return (
      <Container>
        <Typography variant="h6" color="error">
          Không thể tải dữ liệu dashboard
        </Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" gutterBottom>
        Dashboard Admin
      </Typography>

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center">
                <People sx={{ fontSize: 40, color: 'primary.main', mr: 2 }} />
                <Box>
                  <Typography variant="h4">{dashboardData.stats.totalUsers}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Tổng người dùng
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center">
                <Payment sx={{ fontSize: 40, color: 'success.main', mr: 2 }} />
                <Box>
                  <Typography variant="h4">{dashboardData.stats.totalPayments}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Tổng giao dịch
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center">
                <TrendingUp sx={{ fontSize: 40, color: 'warning.main', mr: 2 }} />
                <Box>
                  <Typography variant="h4">{dashboardData.stats.pendingPayments}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Giao dịch chờ xử lý
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center">
                <AccountBalance sx={{ fontSize: 40, color: 'info.main', mr: 2 }} />
                <Box>
                  <Typography variant="h4">
                    {(dashboardData.stats.totalRevenue / 1000000).toFixed(1)}M
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Doanh thu (VNĐ)
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Recent Data */}
      <Grid container spacing={3}>
        {/* Recent Users */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Người dùng mới nhất
            </Typography>
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Tên đăng nhập</TableCell>
                    <TableCell>Họ tên</TableCell>
                    <TableCell>Ngày tạo</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {dashboardData.recentUsers.map((user) => (
                    <TableRow key={user._id}>
                      <TableCell>{user.username}</TableCell>
                      <TableCell>{user.fullName}</TableCell>
                      <TableCell>
                        {new Date(user.createdAt).toLocaleDateString('vi-VN')}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Grid>

        {/* Recent Payments */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Giao dịch gần đây
            </Typography>
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Người dùng</TableCell>
                    <TableCell>Số tiền</TableCell>
                    <TableCell>Trạng thái</TableCell>
                    <TableCell>Ngày</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {dashboardData.recentPayments.map((payment) => (
                    <TableRow key={payment._id}>
                      <TableCell>{payment.user?.username}</TableCell>
                      <TableCell>
                        {payment.amount.toLocaleString('vi-VN')} ₫
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={getStatusText(payment.status)}
                          color={getStatusColor(payment.status)}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        {new Date(payment.createdAt).toLocaleDateString('vi-VN')}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default AdminDashboard;