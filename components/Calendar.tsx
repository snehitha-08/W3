import React, { useState } from 'react';

interface CalendarProps {
  startDate: string | null;
  endDate: string | null;
  onDatesChange: (dates: { startDate: string | null; endDate: string | null }) => void;
}

const Calendar: React.FC<CalendarProps> = ({ startDate, endDate, onDatesChange }) => {
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const handlePrevMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
  };

  const handleDateClick = (day: number) => {
    const clickedDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
    if (isPastDate(clickedDate)) return;
    
    // Correctly format the date string to YYYY-MM-DD in the local timezone
    const year = clickedDate.getFullYear();
    const month = String(clickedDate.getMonth() + 1).padStart(2, '0');
    const dayStr = String(clickedDate.getDate()).padStart(2, '0');
    const clickedDateStr = `${year}-${month}-${dayStr}`;

    if (!startDate || (startDate && endDate)) {
      // Starting a new selection
      onDatesChange({ startDate: clickedDateStr, endDate: null });
    } else if (startDate && !endDate) {
      // Finishing the selection
      const startDateObj = new Date(startDate + 'T00:00:00');
      if (clickedDate > startDateObj) {
        onDatesChange({ startDate, endDate: clickedDateStr });
      } else {
        // Clicked on or before start date, so reset and start new selection
        onDatesChange({ startDate: clickedDateStr, endDate: null });
      }
    }
  };

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const isPastDate = (date: Date) => {
    return date < today;
  };
  
  const start = startDate ? new Date(startDate + 'T00:00:00') : null;
  const end = endDate ? new Date(endDate + 'T00:00:00') : null;

  const renderHeader = () => {
    return (
      <div className="flex justify-between items-center mb-4">
        <button type="button" onClick={handlePrevMonth} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-[#5E6D55]">
          &#x3C;
        </button>
        <div className="text-lg font-semibold text-gray-800 dark:text-gray-200">
          {currentMonth.toLocaleString('default', { month: 'long', year: 'numeric' })}
        </div>
        <button type="button" onClick={handleNextMonth} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-[#5E6D55]">
          &#x3E;
        </button>
      </div>
    );
  };

  const renderDays = () => {
    const days = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];
    return (
      <div className="grid grid-cols-7 text-center text-sm font-medium text-gray-500 dark:text-gray-400">
        {days.map(day => (
          <div key={day}>{day}</div>
        ))}
      </div>
    );
  };

  const renderCells = () => {
    const monthStart = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
    const monthEnd = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0);
    const startDateOfMonth = monthStart.getDay();
    const daysInMonth = monthEnd.getDate();

    const cells = [];
    for (let i = 0; i < startDateOfMonth; i++) {
      cells.push(<div key={`empty-${i}`} className="p-2"></div>);
    }

    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
      date.setHours(0, 0, 0, 0);
      
      const isStartDate = start && date.getTime() === start.getTime();
      const isEndDate = end && date.getTime() === end.getTime();
      const isInRange = start && end && date > start && date < end;
      
      const isPast = isPastDate(date);

      const cellClasses = [
        'w-10 h-10 flex items-center justify-center rounded-full transition-colors duration-200',
        isPast ? 'text-gray-400 dark:text-gray-500 cursor-not-allowed' : 'cursor-pointer hover:bg-green-100 dark:hover:bg-green-900/50',
        today.getTime() === date.getTime() && !isStartDate && !isEndDate && !isInRange && 'border-2 border-[#5E6D55]',
        isInRange && 'bg-green-100 dark:bg-green-900/60 text-[#4A4A4A] dark:text-gray-200 rounded-none',
        (isStartDate || isEndDate) && 'bg-[#5E6D55] dark:bg-[#86a17c] text-white dark:text-black font-bold',
        isStartDate && end && 'rounded-r-none',
        isEndDate && start && 'rounded-l-none',
      ].filter(Boolean).join(' ');
      
      const rangeBgClasses = [
        'p-0.5 flex justify-center items-center',
        (isInRange || isStartDate || isEndDate) && 'bg-green-100 dark:bg-green-900/60',
        isStartDate && 'rounded-l-full',
        isEndDate && 'rounded-r-full',
      ].filter(Boolean).join(' ');

      cells.push(
        <div key={day} className={(start && end) ? rangeBgClasses : 'p-0.5'}>
            <button
            type="button"
            onClick={() => !isPast && handleDateClick(day)}
            disabled={isPast}
            className={cellClasses}
            >
            {day}
            </button>
        </div>
      );
    }

    return (
      <div className="grid grid-cols-7 mt-2">
        {cells}
      </div>
    );
  };


  return (
    <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 shadow-sm">
      {renderHeader()}
      {renderDays()}
      {renderCells()}
    </div>
  );
};

export default Calendar;