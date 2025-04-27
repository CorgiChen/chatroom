import React, { useState } from 'react';

const UserHoverCard = ({ user }) => {
  const [rotation, setRotation] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [isSpinning, setIsSpinning] = useState(false);

  const handleMouseDown = () => {
    if (isSpinning) return;
    setIsDragging(true);
  };

  const handleMouseUp = () => {
    if (isSpinning) return;
    setIsDragging(false);
    setRotation({ x: 0, y: 0 });
  };

  const handleMouseMove = (e) => {
    if (!isDragging || isSpinning) return;
    const { movementX, movementY } = e;
    setRotation((prev) => ({
      x: Math.max(Math.min(prev.x - movementY * 0.5, 30), -30),
      y: Math.max(Math.min(prev.y + movementX * 0.5, 30), -30),
    }));
  };

  const handleTouchStart = (e) => {
    if (isSpinning) return;
    setIsDragging(true);
    const touch = e.touches[0];
    e.target.startX = touch.clientX;
    e.target.startY = touch.clientY;
  };

  const handleTouchMove = (e) => {
    if (!isDragging || isSpinning) return;
    const touch = e.touches[0];
    const movementX = touch.clientX - (e.target.startX || touch.clientX);
    const movementY = touch.clientY - (e.target.startY || touch.clientY);

    setRotation((prev) => ({
      x: Math.max(Math.min(prev.x - movementY * 0.1, 30), -30),
      y: Math.max(Math.min(prev.y + movementX * 0.1, 30), -30),
    }));
  };

  const handleTouchEnd = () => {
    if (isSpinning) return;
    setIsDragging(false);
    setRotation({ x: 0, y: 0 });
  };

  const handleClick = () => {
    if (isSpinning) return;
    setIsSpinning(true);
    setTimeout(() => {
      setIsSpinning(false); // 旋轉完取消 spin
    }, 1200);
  };

  if (!user) return null;

  return (
    <div
      className="animated-border p-1 rounded-2xl"
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseUp}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onClick={handleClick}
    >
      <div
        className={`bg-[#2b2d31] text-white p-6 rounded-2xl shadow-xl w-72 space-y-3 no-select ${
          isSpinning ? 'spin-animation' : ''
        }`}
        style={{
          transform: isSpinning
            ? undefined
            : `rotateX(${rotation.x}deg) rotateY(${rotation.y}deg)`,
          transition: isDragging ? 'none' : 'transform 0.5s ease',
          cursor: isDragging ? 'grabbing' : 'grab',
        }}
      >
        <div className="flex flex-col items-center">
          <img
            src={user.avatarURL || '/corgi_chat.png'}
            alt="頭像"
            className="w-20 h-20 rounded-full object-cover mb-2"
          />
          <div className="text-lg font-bold">{user.nickname || '使用者'}</div>
          <div className="text-sm text-gray-400 selectable">{user.userId || ''}</div> {/* ✅ ID可以選取 */}
        </div>

        <div className="text-sm text-gray-300 mt-2 whitespace-pre-line text-center">
          {user.bio?.trim()
            ? user.bio
            : '這個人什麼也沒留下。'}
        </div>
      </div>
    </div>
  );
};

export default UserHoverCard;
