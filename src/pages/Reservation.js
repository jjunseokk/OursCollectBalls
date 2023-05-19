import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowLeft, faArrowRight } from "@fortawesome/free-solid-svg-icons";

import { useSelector } from 'react-redux'

import "../style/reservation.scss";
import ShopSearch from "../components/ShopSearch";
import Schedule from "../components/Schedule";
import ScheduleCheck from "../components/ScheduleCheck";

import progress_1 from '../img/progress_1.png';
import progress_2 from '../img/progress_2.png';
import progress_3 from '../img/progress_3.png';

const Reservation = () => {
  const [step, setStep] = useState(0);
  const navigate = useNavigate();

  const redux_data = useSelector((state) => state);

  console.log("찐인 데이터 입니다.::", redux_data);

  const handleNext = () => {
    setStep((prevStep) => prevStep + 1);
  };


  const handlePrev = () => {
    if (step === 0) {
      alert("이전 작업이 없습니다.");
    } else {
      setStep((prevStep) => prevStep - 1);
    }
  };

  const handleCancel = () => {
    navigate("/");
  };

  const handleReservationConfirmation = () => {
    const { checked, address, date } = redux_data;

    if (!checked.checked) {
      alert("이용약관에 동의해주세요.");
    } else if (!address.add && !date.date) {
      alert("장소와 일시를 선택했는지 확인해주세요.");
    } else {
      alert("예약이 확정되었습니다.");
      navigate('/ReservationSuccess');
    }
  };

  const renderComponentAndProgressText = () => {
    let currentComponent;
    let progressText;

    switch (step) {
      case 0:
        currentComponent = <ShopSearch />;
        progressText = progress_1;
        break;
      case 1:
        currentComponent = <Schedule />;
        progressText = progress_2;
        break;
      case 2:
        currentComponent = <ScheduleCheck />;
        progressText = progress_3;
        break;
      default:
        currentComponent = <ShopSearch />;
    }

    return { currentComponent, progressText };
  };

  const isLastStep = step === 2;
  const { currentComponent, progressText } = renderComponentAndProgressText();
  const buttonStyles = {
    width: 100,
    height: 30,
    cursor: 'pointer',
    marginRight: 5,
  };

  return (
    <div className="reservation-container">
      <div className="progress-status">
        <div className="progress-text">
          <img src={progressText} style={{ width: '50%', marginTop: 5 }} alt="" />
        </div>
        <div style={{ padding: 10, fontSize: '0.8em' }}>
          <h2 style={{textAlign : 'center', marginBottom : 10}}>선택한 일정 확인</h2>
          <p>장소 : {redux_data.address.add}</p>
          <p>일시 : {redux_data.date.date}</p>
        </div>
      </div>
      <div className="reservation-area">
        {currentComponent}
        <div className="reservation-btnArea">
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <button
              style={buttonStyles}
              onClick={handlePrev}
              disabled={step === 0}
            >
              <FontAwesomeIcon icon={faArrowLeft} /> 뒤로가기
            </button>
            <div style={{ padding: 0 }}>
              <button
                style={buttonStyles}
                onClick={handleCancel}
              >
                취소
              </button>
              <button
                style={{
                  ...buttonStyles,
                  border: "none",
                  backgroundColor: "#AEFF1E",
                }}
                onClick={isLastStep ? handleReservationConfirmation : handleNext}
              >
                {isLastStep ? "예약 확정" : "다음"}{" "}
                {isLastStep && <FontAwesomeIcon icon={faArrowRight} />}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Reservation;