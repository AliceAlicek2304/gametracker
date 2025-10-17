import React from 'react';
import styles from './ConveneRulesModal.module.css';

interface ConveneRulesModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const ConveneRulesModal: React.FC<ConveneRulesModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <h2>Quy Tắc Triệu Hồi</h2>
          <button className={styles.closeButton} onClick={onClose}>×</button>
        </div>
        <div className={styles.modalBody}>
          <section className={styles.section}>
            <h3>Quy Tắc Triệu Hồi</h3>
            <ul>
              <li>
                Đây là banner <strong>[Triệu Hồi Nhân Vật Nổi Bật]</strong> sự kiện. 
                Chi tiết về nội dung có thể triệu hồi được liệt kê trong bảng bên dưới.
              </li>
              <li>
                Sử dụng <strong>[Thủy Triều Rực Rỡ]</strong> để Triệu Hồi. Bạn được đảm bảo ít nhất một 
                Nhân Vật hoặc Vũ Khí 4 Sao trở lên mỗi <span className={styles.highlight}>10 lần</span> triệu hồi.
              </li>
              <li>
                Số lần đảm bảo được chia sẻ giữa tất cả các banner <strong>[Triệu Hồi Nhân Vật Nổi Bật]</strong> sự kiện. 
                Nếu không nhận được Nhân Vật 5 Sao trong banner này, số lần đảm bảo sẽ được chuyển sang 
                các banner <strong>[Triệu Hồi Nhân Vật Nổi Bật]</strong> khác và reset khi nhận được Nhân Vật 5 Sao.
              </li>
            </ul>
          </section>

          <section className={styles.section}>
            <h3>Tỷ Lệ</h3>
            <ul>
              <li>
                Tỷ lệ cơ bản nhận Nhân Vật 5 Sao là <span className={styles.rate}>0.80000%</span>. 
                Tỷ lệ trung bình (bao gồm Đảm Bảo) là <span className={styles.rate}>1.80000%</span>. 
                Bạn được đảm bảo nhận ít nhất một Nhân Vật 5 Sao mỗi <span className={styles.highlight}>80</span> lần Triệu Hồi.
              </li>
              <li>
                Mỗi khi nhận được Nhân Vật 5 Sao, có <span className={styles.rateUp}>50.00000%</span> cơ hội 
                đó là Nhân Vật 5 Sao Nổi Bật của banner này, và <span className={styles.rateUp}>50.00000%</span> cơ hội 
                là Nhân Vật 5 Sao thường ngẫu nhiên. Tất cả Nhân Vật 5 Sao thường có tỷ lệ rơi bằng nhau. 
                Nếu Nhân Vật 5 Sao nhận được không phải là Nhân Vật Nổi Bật, Nhân Vật 5 Sao tiếp theo{' '}
                <span className={styles.guaranteed}>được đảm bảo</span> là Nhân Vật Nổi Bật.
              </li>
              <li>
                Tỷ lệ cơ bản nhận Nhân Vật hoặc Vũ Khí 4 Sao là <span className={styles.rate}>6.00000%</span>. 
                Tỷ lệ trung bình (bao gồm Đảm Bảo) là <span className={styles.rate}>12.00000%</span>. 
                Bạn được đảm bảo nhận ít nhất một Nhân Vật hoặc Vũ Khí 4 Sao trở lên mỗi{' '}
                <span className={styles.highlight}>10</span> lần Triệu Hồi.
              </li>
              <li>
                Mỗi khi nhận được vật phẩm 4 Sao, có <span className={styles.rateUp}>50.00000%</span> cơ hội 
                đó là Nhân Vật 4 Sao Nổi Bật của banner này. Tất cả Nhân Vật 4 Sao Nổi Bật có tỷ lệ rơi bằng nhau; 
                và <span className={styles.rateUp}>50.00000%</span> cơ hội là vật phẩm 4 Sao thường ngẫu nhiên. 
                Tất cả vật phẩm 4 Sao thường có tỷ lệ rơi bằng nhau. Nếu vật phẩm 4 Sao nhận được không thuộc Nhân Vật Nổi Bật, 
                vật phẩm 4 Sao tiếp theo <span className={styles.guaranteed}>được đảm bảo</span> là Nhân Vật 4 Sao Nổi Bật ngẫu nhiên. 
                Tất cả Nhân Vật 4 Sao Nổi Bật có tỷ lệ rơi bằng nhau.
              </li>
              <li>
                Tỷ lệ cơ bản nhận Vũ Khí 3 Sao là 93.20000%. Tất cả Vũ Khí 3 Sao có tỷ lệ rơi bằng nhau.
              </li>
              <li className={styles.note}>
                ※Vui lòng tham khảo Trang Web Chính Thức của Wuthering Waves để biết thêm chi tiết về tỷ lệ rơi.
              </li>
            </ul>
          </section>

          <section className={styles.section}>
            <h3>Phần Thưởng Bổ Sung</h3>
            <ul>
              <li>
                Khi nhận Nhân Vật 5 Sao lần đầu tiên, bạn sẽ nhận <span className={styles.reward}>15</span> Afterglow Corals. 
                Khi nhận Nhân Vật 5 Sao mà bạn đã sở hữu lần thứ 2 – 7, bạn sẽ nhận{' '}
                <span className={styles.reward}>1</span> Waveband của Nhân Vật đó và <span className={styles.reward}>15</span> Afterglow Corals. 
                Từ lần thứ 8 trở đi, bạn sẽ nhận <span className={styles.reward}>40</span> Afterglow Corals.
              </li>
              <li>
                Khi nhận Nhân Vật 4 Sao lần đầu tiên, bạn sẽ nhận <span className={styles.reward}>3</span> Afterglow Corals. 
                Khi nhận Nhân Vật 4 Sao mà bạn đã sở hữu lần thứ 2 – 7, bạn sẽ nhận{' '}
                <span className={styles.reward}>1</span> Waveband của Nhân Vật đó và <span className={styles.reward}>3</span> Afterglow Corals. 
                Từ lần thứ 8 trở đi, bạn sẽ nhận <span className={styles.reward}>8</span> Afterglow Corals.
              </li>
              <li>
                Mỗi khi bạn nhận được Vũ Khí 4 Sao, bạn sẽ nhận <span className={styles.reward}>3</span> Afterglow Corals.
              </li>
              <li>
                Mỗi khi bạn nhận được Vũ Khí 3 Sao, bạn sẽ nhận <span className={styles.reward}>15</span> Oscillated Corals.
              </li>
              <li>
                Mỗi khi bạn nhận được Nhân Vật 5 Sao không phải là Nhân Vật Nổi Bật, bạn sẽ nhận thêm{' '}
                <span className={styles.reward}>30</span> Afterglow Corals.
              </li>
            </ul>
          </section>

          <section className={styles.section}>
            <h3>Ghi Chú</h3>
            <ul>
              <li>
                Bạn có thể đổi <strong>tối đa 2</strong> Waveband giới hạn cho mỗi Nhân Vật 5 Sao bằng Afterglow Corals.
              </li>
              <li>
                Bạn có thể đổi nhiều vật phẩm khác bằng Oscillated Corals. Vui lòng truy cập trang Cửa Hàng trong game 
                để biết các tùy chọn hiện tại và giới hạn đổi thưởng, sẽ được reset mỗi phiên bản cập nhật.
              </li>
            </ul>
          </section>
        </div>
      </div>
    </div>
  );
};

export default ConveneRulesModal;
