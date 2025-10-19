import React, { useEffect, useRef } from 'react';
import { showToast } from '../../utils/toast';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const OAuth2Redirect: React.FC = () => {
  const calledRef = useRef(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const code = params.get('code');
    const redirectUri = window.location.origin + '/oauth2/redirect';

    if (calledRef.current) return;
    calledRef.current = true;

    if (code) {
      fetch('/api/auth/oauth2/code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code, provider: 'google', redirectUri })
      })
        .then(res => res.json())
        .then(data => {
          if (data && (data.token || data.accessToken)) {
            const token = data.token || data.accessToken;
            localStorage.setItem('token', token);
            login({
              id: data.id,
              username: data.username,
              email: data.email,
              fullName: data.fullName,
              avatar: data.avatar || '/uploads/avatar/default-avatar.jpg',
              roles: [`ROLE_${data.role}`],
            });
            showToast.success('Đăng nhập Google thành công!');
            navigate('/');
          } else {
            if (data && data.error && data.error === 'EMAIL_EXISTS_LOCAL') {
              showToast.error('Email này đã được đăng ký bằng tài khoản thường. Vui lòng đăng nhập bằng mật khẩu hoặc sử dụng chức năng quên mật khẩu.');
            } else {
              showToast.error('Đăng nhập Google thất bại. Vui lòng thử lại hoặc liên hệ hỗ trợ.');
            }
            navigate('/');
          }
        })
        .catch(() => {
          showToast.error('Đăng nhập Google thất bại. Vui lòng thử lại hoặc liên hệ hỗ trợ.');
          navigate('/');
        });
    } else {
      navigate('/');
    }
    // eslint-disable-next-line
  }, []);

  return (
    <div style={{ textAlign: 'center', marginTop: '4rem', color: '#3b82f6' }}>
      <h2>Đang xác thực với Google...</h2>
    </div>
  );
};

export default OAuth2Redirect;
