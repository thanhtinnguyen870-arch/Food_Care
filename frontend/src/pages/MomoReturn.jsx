import { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { CheckCircle, Clock, XCircle } from 'lucide-react';
import axiosClient from '../api/axiosClient';

const MomoReturn = () => {
  const [searchParams] = useSearchParams();
  const [confirming, setConfirming] = useState(false);
  const [devConfirmed, setDevConfirmed] = useState(false);
  const [devMessage, setDevMessage] = useState('');
  const resultCode = searchParams.get('resultCode');
  const message = searchParams.get('message');
  const simulationMode = searchParams.get('simulation') === '1';
  const isSuccess = resultCode === '0';
  const isPending = resultCode === null && !simulationMode;
  const pendingMomoOrderId = localStorage.getItem('pendingMomoOrderId');
  const displaySuccess = isSuccess || devConfirmed;
  const canDevConfirm = Boolean(pendingMomoOrderId) && !displaySuccess;

  const confirmDevPayment = async () => {
    if (!pendingMomoOrderId || confirming) return;

    setConfirming(true);
    setDevMessage('');
    try {
      await axiosClient.post('/payments/momo/dev-confirm', {
        orderId: pendingMomoOrderId,
      });
      localStorage.removeItem('pendingMomoOrderId');
      setDevConfirmed(true);
      setDevMessage('Thanh toán MoMo đã được xác nhận thành công.');
    } catch (error) {
      setDevMessage(
        error.response?.data?.message ||
          'Không thể xác nhận thanh toán thành công.',
      );
    } finally {
      setConfirming(false);
    }
  };

  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center py-20 px-4 text-center">
      {/* Status Icon */}
      <div className="relative mb-8">
        <div className={`w-28 h-28 rounded-full flex items-center justify-center shadow-lg ${
          displaySuccess ? 'bg-green-50' : isPending ? 'bg-orange-50' : 'bg-red-50'
        }`}>
          {displaySuccess ? (
            <CheckCircle size={64} className="text-healthy" />
          ) : isPending ? (
            <Clock size={64} className="text-primary" />
          ) : (
            <XCircle size={64} className="text-red-500" />
          )}
        </div>
        {displaySuccess && <div className="absolute -top-1 -right-1 text-3xl animate-bounce">🎉</div>}
      </div>

      <h2 className="text-4xl font-black text-dark mb-3">
        {displaySuccess
          ? 'Thanh toán thành công!'
          : isPending
            ? 'Đang kiểm tra thanh toán'
            : 'Thanh toán chưa hoàn tất'}
      </h2>

      <p className="text-gray-500 mb-8 max-w-md leading-relaxed">
        {displaySuccess
          ? 'Cảm ơn bạn. Đơn hàng đã được cập nhật thành đã thanh toán.'
          : message ||
            'Bạn có thể xem lại đơn hàng trong trang theo dõi đơn.'}
      </p>

      {devConfirmed && (
        <div className="mb-8 w-full max-w-md rounded-xl border border-green-100 bg-green-50 p-4">
          <p className="text-sm font-semibold text-green-700">{devMessage}</p>
        </div>
      )}

      {canDevConfirm && (
        <div className="mb-8 w-full max-w-md rounded-xl border border-pink-100 bg-pink-50 p-4">
          <p className="mb-3 text-sm font-semibold text-pink-800">
            Chế độ phát triển: giả lập giao dịch MoMo thành công cho đơn hàng này.
          </p>
          <button
            type="button"
            onClick={confirmDevPayment}
            disabled={confirming}
            className="w-full rounded-xl bg-primary px-5 py-3 font-bold text-white shadow-md transition-colors hover:bg-orange-600 disabled:opacity-70"
          >
            {confirming
              ? 'Đang xác nhận...'
              : 'Giả lập thanh toán thành công'}
          </button>
          {devMessage && (
            <p className="mt-3 text-sm font-semibold text-red-600">
              {devMessage}
            </p>
          )}
        </div>
      )}

      {!pendingMomoOrderId && !displaySuccess && (
        <div className="mb-8 w-full max-w-md rounded-xl border border-amber-100 bg-amber-50 p-4">
          <p className="text-sm font-semibold text-amber-800">
            Không tìm thấy đơn MoMo đang chờ. Hãy tạo lại đơn thanh toán MoMo
            để sử dụng chức năng giả lập.
          </p>
        </div>
      )}

      <div className="flex flex-col sm:flex-row gap-3">
        <Link
          to="/profile?tab=tracking"
          className="bg-primary text-white px-8 py-3 rounded-full font-bold shadow-lg hover:bg-orange-600 transition-all hover:-translate-y-1"
        >
          Theo dõi đơn hàng
        </Link>
        <Link
          to="/foods"
          className="bg-gray-100 text-gray-700 px-8 py-3 rounded-full font-bold hover:bg-gray-200 transition-all hover:-translate-y-1"
        >
          Tiếp tục chọn món
        </Link>
      </div>
    </div>
  );
};

export default MomoReturn;
