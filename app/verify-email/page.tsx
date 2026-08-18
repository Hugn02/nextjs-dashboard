'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';

const AUTH_API = process.env.NEXT_PUBLIC_AUTH_API_URL || 'http://localhost:3002/auth';

function VerifyEmailContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const token = searchParams.get('token');

    const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
    const [message, setMessage] = useState('');
    const [resendEmail, setResendEmail] = useState('');
    const [resendStatus, setResendStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
    const [resendMsg, setResendMsg] = useState('');

    useEffect(() => {
        if (!token) {
            setStatus('error');
            setMessage('Thiếu mã xác thực (token) trên đường dẫn. Vui lòng kiểm tra lại email của bạn.');
            return;
        }

        let isMounted = true;

        const verifyToken = async () => {
            try {
                const res = await fetch(`${AUTH_API}/verify-email`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ token }),
                });

                const data = await res.json();

                if (!isMounted) return;

                if (res.ok) {
                    setStatus('success');
                    setMessage(data.message || 'Tài khoản của bạn đã được xác thực email thành công!');
                    if (typeof window !== 'undefined') {
                        const verifiedEmail = data.email || '';
                        try {
                            const bc = new BroadcastChannel('email_verification_channel');
                            bc.postMessage({ status: 'verified', email: verifiedEmail });
                            bc.close();
                        } catch (e) {}
                        localStorage.setItem('email_verified_event', JSON.stringify({ status: 'verified', email: verifiedEmail, t: Date.now() }));
                    }
                } else {
                    setStatus('error');
                    setMessage(data.message || 'Mã xác thực không hợp lệ hoặc đã hết hạn.');
                }
            } catch (err: any) {
                if (!isMounted) return;
                setStatus('error');
                setMessage('Không thể kết nối đến máy chủ. Vui lòng thử lại sau.');
            }
        };

        verifyToken();

        return () => {
            isMounted = false;
        };
    }, [token]);

    const handleResend = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!resendEmail) return;

        setResendStatus('loading');
        setResendMsg('');

        try {
            const res = await fetch(`${AUTH_API}/resend-verification`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: resendEmail }),
            });

            const data = await res.json();

            if (res.ok) {
                setResendStatus('success');
                setResendMsg(data.message || 'Đã gửi lại email xác thực thành công. Vui lòng kiểm tra hộp thư!');
            } else {
                setResendStatus('error');
                setResendMsg(data.message || 'Không thể gửi lại email xác thực.');
            }
        } catch (err) {
            setResendStatus('error');
            setResendMsg('Có lỗi xảy ra khi gửi yêu cầu. Vui lòng thử lại sau.');
        }
    };

    return (
        <div className="min-h-[80vh] flex items-center justify-center px-4 py-16 bg-[#fbf9f5] font-sans">
            <div className="max-w-md w-full bg-white rounded-2xl p-8 shadow-xl border border-[#c4a84f]/20 text-center">
                {/* ── LOADING STATE ── */}
                {status === 'loading' && (
                    <div className="flex flex-col items-center py-8">
                        <div className="w-14 h-14 border-4 border-[#c4a84f]/30 border-t-[#c4a84f] rounded-full animate-spin mb-6" />
                        <h2 className="text-xl font-bold text-[#2c1a00] mb-2 font-['Cormorant_Garamond',_serif]">
                            ĐANG XÁC THỰC EMAIL...
                        </h2>
                        <p className="text-sm text-[#776b5d]">Vui lòng chờ trong giây lát trong khi hệ thống xác minh tài khoản của bạn.</p>
                    </div>
                )}

                {/* ── SUCCESS STATE ── */}
                {status === 'success' && (
                    <div className="flex flex-col items-center py-4">
                        <div className="w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center border border-emerald-200 mb-5 text-emerald-600">
                            <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                            </svg>
                        </div>
                        <h2 className="text-2xl font-bold text-[#2c1a00] mb-3 font-['Cormorant_Garamond',_serif]">
                            XÁC THỰC THÀNH CÔNG!
                        </h2>
                        <p className="text-sm text-[#5c4f42] leading-relaxed mb-4">
                            {message}
                        </p>
                        <p className="text-xs text-[#888] font-sans bg-[#f7f3eb] p-3 rounded-lg border border-[#c4a84f]/20 text-[#6e5828]">
                            Tài khoản của bạn đã được kích hoạt. Bạn có thể đóng thẻ (tab) này và quay lại trang chính để đăng nhập.
                        </p>
                    </div>
                )}

                {/* ── ERROR STATE ── */}
                {status === 'error' && (
                    <div className="flex flex-col items-center py-4">
                        <div className="w-16 h-16 bg-amber-50 rounded-full flex items-center justify-center border border-amber-200 mb-5 text-amber-600">
                            <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                            </svg>
                        </div>
                        <h2 className="text-2xl font-bold text-[#2c1a00] mb-3 font-['Cormorant_Garamond',_serif]">
                            XÁC THỰC THẤT BẠI
                        </h2>
                        <p className="text-sm text-[#8c433e] leading-relaxed mb-6 bg-red-50 p-3 rounded-lg border border-red-100 w-full">
                            {message}
                        </p>

                        {/* Form gửi lại email xác thực */}
                        <div className="w-full text-left bg-[#fdfbf7] p-5 rounded-xl border border-[#c4a84f]/20 mb-6">
                            <h3 className="text-sm font-bold text-[#2c1a00] mb-2 uppercase tracking-wide">
                                Gửi lại email xác thực
                            </h3>
                            <p className="text-xs text-[#776b5d] mb-4">
                                Nhập địa chỉ email của bạn bên dưới để nhận liên kết kích hoạt mới:
                            </p>
                            <form onSubmit={handleResend} className="space-y-3">
                                <input
                                    type="email"
                                    required
                                    placeholder="Nhập email của bạn..."
                                    value={resendEmail}
                                    onChange={(e) => setResendEmail(e.target.value)}
                                    className="w-full px-3.5 py-2.5 bg-white border border-[#d8caab] rounded-lg text-sm focus:outline-none focus:border-[#c4a84f] text-[#2c1a00]"
                                />
                                <button
                                    type="submit"
                                    disabled={resendStatus === 'loading'}
                                    className="w-full py-2.5 bg-[#2c1a00] text-[#c4a84f] font-bold text-xs uppercase tracking-wider rounded-lg hover:bg-[#3d2705] transition-all disabled:opacity-50"
                                >
                                    {resendStatus === 'loading' ? 'Đang gửi...' : 'Gửi lại Email Xác Thực'}
                                </button>
                            </form>

                            {resendMsg && (
                                <p className={`mt-3 text-xs p-2.5 rounded-md ${resendStatus === 'success' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
                                    {resendMsg}
                                </p>
                            )}
                        </div>

                        <Link
                            href="/"
                            className="text-xs text-[#c4a84f] font-bold underline hover:text-[#2c1a00] transition-colors"
                        >
                            Quay lại Trang chủ
                        </Link>
                    </div>
                )}
            </div>
        </div>
    );
}

export default function VerifyEmailPage() {
    return (
        <Suspense fallback={
            <div className="min-h-[80vh] flex items-center justify-center">
                <div className="w-10 h-10 border-4 border-[#c4a84f]/30 border-t-[#c4a84f] rounded-full animate-spin" />
            </div>
        }>
            <VerifyEmailContent />
        </Suspense>
    );
}
