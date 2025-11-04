import React from 'react'
import { Link } from 'react-router-dom'

const OurStory = () => {
    return (
      <>
        <section id="furniture_story">
          <div className="container">
            <div className="row">
              <div className="col-lg-8 offset-lg-2">
                <div className="our_story_content">
                  <h2>Our Story</h2>
                  <p>
                    The book description simply answers the question: what is
                    the book about? It’s different from the book blurb that goes
                    on the back of your physical book. Your book description is
                    part of your metadata, which holds your book details for
                    stores and readers to access. And to successfully sell your
                    book, you want to regularly optimize your metadata
                    throughout your publishing journey. Before learning how to
                    write a book description that sells, let’s go over what book
                    metadata exactly is.
                  </p>
                  <Link to="/about" className="theme-btn-one bg-black btn_md">
                    Read Full Story
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>
      </>
    );
}

export default OurStory
