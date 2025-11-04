import React, { useEffect, useRef, useState } from "react";
import img from "../../../assets/img/furniture/common/clock5.avif";
import img1 from "../../../assets/img/furniture/common/bf3.avif";

const BlackFriday = () => {
  const [timerDays, setTimerDays] = useState("00");
  const [timerHours, setTimerHours] = useState("00");
  const [timerMinutes, setTimerMinutes] = useState("00");
  const [timerSeconds, setTimerSeconds] = useState("00");

  const interval = useRef();

  const getCountdownToOctober21 = () => {
    const today = new Date();
    const year = today.getFullYear();
    let targetDate = new Date(`${year}-10-21T00:00:00`);

    // Agar bugungi sana 21-oktabrdan keyin bo‘lsa, keyingi yilgi 21-oktabrni olamiz
    if (today > targetDate) {
      targetDate = new Date(`${year + 1}-10-21T00:00:00`);
    }

    return targetDate;
  };

  const startTimer = () => {
    const countdownDate = getCountdownToOctober21().getTime();

    interval.current = setInterval(() => {
      const now = new Date().getTime();
      const distance = countdownDate - now;

      if (distance < 0) {
        clearInterval(interval.current);
      } else {
        const days = Math.floor(distance / (1000 * 60 * 60 * 24));
        const hours = Math.floor(
          (distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
        );
        const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((distance % (1000 * 60)) / 1000);

        setTimerDays(days < 10 ? `0${days}` : `${days}`);
        setTimerHours(hours < 10 ? `0${hours}` : `${hours}`);
        setTimerMinutes(minutes < 10 ? `0${minutes}` : `${minutes}`);
        setTimerSeconds(seconds < 10 ? `0${seconds}` : `${seconds}`);
      }
    }, 1000);
  };

  useEffect(() => {
    startTimer();
    return () => clearInterval(interval.current);
  }, []);

  return (
    <section id="offer_timer_two">
      <div className="container">
        <div className="row">
          <div className="col-md-6 col-sm-12 col-12">
            <div className="offer_time_img_two">
              <img src={img} alt="img" />
            </div>
          </div>
          <div className="col-md-6 col-sm-12 col-12">
            <div className="offer_time_two_Content">
              <img src={img1} alt="img" />
              <div id="countdown_two">
                <ul>
                  <li>
                    <span>{timerDays}</span>Days
                  </li>
                  <li>
                    <span>{timerHours}</span>Hours
                  </li>
                  <li>
                    <span>{timerMinutes}</span>Minutes
                  </li>
                  <li>
                    <span>{timerSeconds}</span>Seconds
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default BlackFriday;
