import React from "react";

const Reservation = () => {
  return (
    <>
     
      <section
        className="site-hero inner-page overlay"
        style={{ backgroundImage: "url('/images/hero_4.jpg')" }}
        data-stellar-background-ratio="0.5"
      >
        <div className="container">
          <div className="row site-hero-inner justify-content-center align-items-center">
            <div className="col-md-10 text-center" data-aos="fade">
              <h1 className="heading mb-3">Reservation Form</h1>
              <ul className="custom-breadcrumbs mb-4">
                <li><a href="/">Home</a></li>
                <li>&bullet;</li>
                <li>Reservation</li>
              </ul>
            </div>
          </div>
        </div>

        <a className="mouse smoothscroll" href="#next">
          <div className="mouse-icon">
            <span className="mouse-wheel"></span>
          </div>
        </a>
      </section>

      {/* FORM SECTION */}
      <section className="section contact-section" id="next">
        <div className="container">
          <div className="row">

            <div className="col-md-7" data-aos="fade-up">
              <form className="bg-white p-md-5 p-4 mb-5 border">
                <div className="row">

                  <div className="col-md-6 form-group">
                    <label htmlFor="name" className="text-black font-weight-bold">
                      Name
                    </label>
                    <input type="text" id="name" className="form-control" />
                  </div>

                  <div className="col-md-6 form-group">
                    <label htmlFor="phone" className="text-black font-weight-bold">
                      Phone
                    </label>
                    <input type="text" id="phone" className="form-control" />
                  </div>

                </div>

                <div className="form-group">
                  <label htmlFor="email" className="text-black font-weight-bold">
                    Email
                  </label>
                  <input type="email" id="email" className="form-control" />
                </div>

                <div className="row">
                  <div className="col-md-6 form-group">
                    <label htmlFor="checkin_date" className="text-black font-weight-bold">
                      Date Check In
                    </label>
                    <input type="text" id="checkin_date" className="form-control" />
                  </div>

                  <div className="col-md-6 form-group">
                    <label htmlFor="checkout_date" className="text-black font-weight-bold">
                      Date Check Out
                    </label>
                    <input type="text" id="checkout_date" className="form-control" />
                  </div>
                </div>

                <div className="row">
                  <div className="col-md-6 form-group">
                    <label htmlFor="adults" className="font-weight-bold text-black">
                      Adults
                    </label>
                    <select id="adults" className="form-control">
                      <option>1</option>
                      <option>2</option>
                      <option>3</option>
                      <option>4+</option>
                    </select>
                  </div>

                  <div className="col-md-6 form-group">
                    <label htmlFor="children" className="font-weight-bold text-black">
                      Children
                    </label>
                    <select id="children" className="form-control">
                      <option>1</option>
                      <option>2</option>
                      <option>3</option>
                      <option>4+</option>
                    </select>
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="message" className="text-black font-weight-bold">
                    Notes
                  </label>
                  <textarea
                    id="message"
                    className="form-control"
                    rows="6"
                  ></textarea>
                </div>

                <button className="btn btn-primary text-white px-5 py-3">
                  Reserve Now
                </button>
              </form>
            </div>

            {/* CONTACT INFO */}
            <div className="col-md-5" data-aos="fade-up">
              <div className="contact-info ml-auto">
                <p><strong>Address:</strong> 98 West 21th Street, NY</p>
                <p><strong>Phone:</strong> (+1) 435 3533</p>
                <p><strong>Email:</strong> info@yourdomain.com</p>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* CTA */}
      <section
        className="section bg-image overlay"
        style={{ backgroundImage: "url('/images/hero_4.jpg')" }}
      >
        <div className="container">
          <div className="row align-items-center">
            <div className="col-md-6 text-white">
              <h2>A Best Place To Stay. Reserve Now!</h2>
            </div>
            <div className="col-md-6 text-md-right">
              <a href="/reservation" className="btn btn-outline-white-primary px-5 py-3">
                Reserve Now
              </a>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default Reservation;
