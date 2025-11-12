import React, { useState, useEffect } from 'react'
import { useSelector } from "react-redux";
import ServiceManager from '../../../services/ServiceManager';
import AuthService from '../../../services/AuthService';
import { RatingStar } from "rating-star";
import Swal from "sweetalert2";

const ProductInfo = () => {
    const product = useSelector((state) => state.products.single);
    const [reviews, setReviews] = useState([]);
    const [users, setUsers] = useState({});
    const [loading, setLoading] = useState(false);
    const [showReviewForm, setShowReviewForm] = useState(false);
    const [reviewForm, setReviewForm] = useState({
        Grade: 5,
        Review: ''
    });
    const [submittingReview, setSubmittingReview] = useState(false);
    const [currentUser, setCurrentUser] = useState(null);
    const authService = new AuthService();
    
    // Загружаем текущего пользователя
    useEffect(() => {
        const user = authService.getCurrentUser();
        setCurrentUser(user);
    }, []);

    useEffect(() => {
        const loadReviews = async () => {
            if (!product || !product.id) {
                console.log('⚠️ ProductInfo: No product or product.id found');
                return;
            }
            
            // Преобразуем ID в число, если это строка
            const bookId = typeof product.id === 'string' ? parseInt(product.id) : product.id;
            console.log(`🔄 ProductInfo: Loading reviews for book ID: ${bookId} (original: ${product.id})`);
            
            setLoading(true);
            try {
                const serviceManager = ServiceManager.getInstance();
                const bookReviews = await serviceManager.reviewService.getReviewsByBook(bookId);
                console.log(`✅ ProductInfo: Loaded ${bookReviews.length} reviews for book ${bookId}`, bookReviews);
                setReviews(bookReviews);
                
                // Загружаем информацию о пользователях для отзывов
                const userIds = [...new Set(bookReviews.map(r => r.id_User))];
                const usersData = {};
                
                await Promise.all(
                    userIds.map(async (userId) => {
                        try {
                            const user = await serviceManager.userService.getUser(userId);
                            usersData[userId] = user;
                        } catch (error) {
                            console.warn(`Error loading user ${userId}:`, error);
                        }
                    })
                );
                
                setUsers(usersData);
            } catch (error) {
                console.error('Error loading reviews:', error);
            } finally {
                setLoading(false);
            }
        };
        
        loadReviews();
    }, [product]);
    
    const getUserName = (userId) => {
        const user = users[userId];
        if (user) {
            return `${user.First_name || ''} ${user.Last_name || ''}`.trim() || 'Anonymous';
        }
        return 'Anonymous';
    };

    // Алгоритм добавления и обработки отзывов
    const handleSubmitReview = async () => {
        // Проверка авторизации
        if (!currentUser) {
            Swal.fire({
                icon: 'warning',
                title: 'Требуется авторизация',
                text: 'Пожалуйста, войдите в систему, чтобы оставить отзыв.',
                confirmButtonText: 'Войти',
                showCancelButton: true,
                cancelButtonText: 'Отмена'
            }).then((result) => {
                if (result.isConfirmed) {
                    window.location.href = '/login';
                }
            });
            return;
        }

        if (!product || !product.id) {
            Swal.fire({
                icon: 'error',
                title: 'Ошибка',
                text: 'Не удалось определить книгу для отзыва'
            });
            return;
        }

        if (!reviewForm.Grade || reviewForm.Grade < 1 || reviewForm.Grade > 5) {
            Swal.fire({
                icon: 'error',
                title: 'Ошибка',
                text: 'Оценка должна быть от 1 до 5'
            });
            return;
        }

        // Проверяем, не оставлял ли пользователь уже отзыв на эту книгу
        const existingReview = reviews.find(r => r.id_User === currentUser.ID);
        if (existingReview) {
            Swal.fire({
                icon: 'info',
                title: 'Отзыв уже оставлен',
                text: 'Вы уже оставили отзыв на эту книгу. Вы можете обновить его.',
                confirmButtonText: 'Обновить',
                showCancelButton: true,
                cancelButtonText: 'Отмена'
            }).then(async (result) => {
                if (result.isConfirmed) {
                    // Обновляем существующий отзыв
                    try {
                        const serviceManager = ServiceManager.getInstance();
                        await serviceManager.reviewService.updateReview({
                            ID: existingReview.ID,
                            Grade: reviewForm.Grade,
                            Review: reviewForm.Review.trim() || undefined
                        });
                        
                        Swal.fire({
                            icon: 'success',
                            title: 'Отзыв обновлён!',
                            text: 'Ваш отзыв был успешно обновлён.',
                            timer: 2000
                        });

                        // Обновляем список отзывов
                        const bookId = typeof product.id === 'string' ? parseInt(product.id) : product.id;
                        const bookReviews = await serviceManager.reviewService.getReviewsByBook(bookId);
                        setReviews(bookReviews);

                        // Сбрасываем форму
                        setReviewForm({ Grade: 5, Review: '' });
                        setShowReviewForm(false);
                    } catch (error) {
                        console.error('Error updating review:', error);
                        Swal.fire({
                            icon: 'error',
                            title: 'Ошибка',
                            text: error.response?.data?.error || 'Не удалось обновить отзыв.'
                        });
                    }
                }
            });
            return;
        }

        setSubmittingReview(true);
        try {
            const serviceManager = ServiceManager.getInstance();
            const bookId = typeof product.id === 'string' ? parseInt(product.id) : product.id;
            
            const reviewData = {
                Grade: reviewForm.Grade,
                Id_Book: bookId,
                id_User: currentUser.ID,
                Review: reviewForm.Review.trim() || undefined
            };

            await serviceManager.reviewService.createReview(reviewData);
            
            Swal.fire({
                icon: 'success',
                title: 'Отзыв добавлен!',
                text: 'Ваш отзыв был успешно добавлен.',
                timer: 2000
            });

            // Обновляем список отзывов и информацию о пользователях
            const bookReviews = await serviceManager.reviewService.getReviewsByBook(bookId);
            setReviews(bookReviews);
            
            // Загружаем информацию о новом пользователе, если нужно
            if (!users[currentUser.ID]) {
                try {
                    const user = await serviceManager.userService.getUser(currentUser.ID);
                    setUsers(prev => ({ ...prev, [currentUser.ID]: user }));
                } catch (error) {
                    console.warn('Error loading user:', error);
                }
            }

            // Сбрасываем форму
            setReviewForm({ Grade: 5, Review: '' });
            setShowReviewForm(false);
        } catch (error) {
            console.error('Error submitting review:', error);
            Swal.fire({
                icon: 'error',
                title: 'Ошибка',
                text: error.response?.data?.error || 'Не удалось добавить отзыв. Попробуйте позже.'
            });
        } finally {
            setSubmittingReview(false);
        }
    };
    
    return (
        <>
            <div className="row">
                <div className="col-lg-12">
                    <div className="product_details_tabs">
                        <ul className="nav nav-tabs">
                            <li><a data-toggle="tab" href="#description" className="active">Description</a></li>
                            <li><a data-toggle="tab" href="#reviews">Reviews ({reviews.length})</a></li>
                        </ul>
                        <div className="tab-content">
                            <div id="description" className="tab-pane fade in show active">
                                <div className="product_description">
                                    {product && product.fullDescription && product.fullDescription.trim() ? (
                                        <div style={{ whiteSpace: 'pre-wrap', lineHeight: '1.8' }}>{product.fullDescription}</div>
                                    ) : null}
                                </div>
                            </div>
                            <div id="reviews" className="tab-pane fade">
                                <div className="product_reviews" style={{ padding: '20px 0' }}>
                                    {/* Форма добавления отзыва - показываем всегда */}
                                    <div style={{ marginBottom: '30px' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                                            <h4 style={{ fontSize: '18px', fontWeight: 'bold', margin: 0 }}>
                                                {reviews.length > 0 ? `Отзывы (${reviews.length})` : 'Отзывы'}
                                            </h4>
                                            <button
                                                onClick={() => {
                                                    if (!currentUser) {
                                                        Swal.fire({
                                                            icon: 'warning',
                                                            title: 'Требуется авторизация',
                                                            text: 'Пожалуйста, войдите в систему, чтобы оставить отзыв.',
                                                            confirmButtonText: 'Войти',
                                                            showCancelButton: true
                                                        }).then((result) => {
                                                            if (result.isConfirmed) {
                                                                window.location.href = '/login';
                                                            }
                                                        });
                                                        return;
                                                    }
                                                    setShowReviewForm(!showReviewForm);
                                                }}
                                                style={{
                                                    padding: '10px 20px',
                                                    backgroundColor: showReviewForm ? '#6c757d' : '#007bff',
                                                    color: 'white',
                                                    border: 'none',
                                                    borderRadius: '6px',
                                                    cursor: 'pointer',
                                                    fontSize: '14px',
                                                    fontWeight: '500',
                                                    transition: 'all 0.3s ease',
                                                    boxShadow: showReviewForm ? 'none' : '0 2px 4px rgba(0,123,255,0.3)'
                                                }}
                                                onMouseEnter={(e) => {
                                                    if (!showReviewForm) {
                                                        e.target.style.backgroundColor = '#0056b3';
                                                        e.target.style.transform = 'translateY(-1px)';
                                                    }
                                                }}
                                                onMouseLeave={(e) => {
                                                    if (!showReviewForm) {
                                                        e.target.style.backgroundColor = '#007bff';
                                                        e.target.style.transform = 'translateY(0)';
                                                    }
                                                }}
                                            >
                                                {showReviewForm ? '✕ Отменить' : '✎ Добавить отзыв'}
                                            </button>
                                        </div>
                                        
                                        {showReviewForm && (
                                            <div className="review_form" style={{
                                                marginBottom: '30px',
                                                padding: '25px',
                                                backgroundColor: '#ffffff',
                                                borderRadius: '10px',
                                                border: '2px solid #e9ecef',
                                                boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                                            }}>
                                                <div style={{ marginBottom: '20px' }}>
                                                    <h5 style={{ 
                                                        marginBottom: '5px',
                                                        fontSize: '18px',
                                                        fontWeight: '600',
                                                        color: '#2c3e50'
                                                    }}>
                                                        Оставить отзыв
                                                    </h5>
                                                    {currentUser && (
                                                        <p style={{ 
                                                            margin: 0,
                                                            fontSize: '14px',
                                                            color: '#6c757d'
                                                        }}>
                                                            Вы вошли как: <strong>{currentUser.First_name} {currentUser.Last_name}</strong>
                                                        </p>
                                                    )}
                                                </div>
                                                <div style={{ marginBottom: '20px' }}>
                                                    <label style={{ 
                                                        display: 'block', 
                                                        marginBottom: '10px', 
                                                        fontWeight: '600',
                                                        fontSize: '15px',
                                                        color: '#495057'
                                                    }}>
                                                        Оценка: <span style={{ color: '#ffc107', fontSize: '18px' }}>{reviewForm.Grade} из 5</span>
                                                    </label>
                                                    <div style={{ 
                                                        display: 'flex', 
                                                        alignItems: 'center', 
                                                        gap: '8px',
                                                        padding: '10px',
                                                        backgroundColor: '#f8f9fa',
                                                        borderRadius: '8px'
                                                    }}>
                                                        {[1, 2, 3, 4, 5].map((star) => (
                                                            <span
                                                                key={star}
                                                                onClick={() => setReviewForm({ ...reviewForm, Grade: star })}
                                                                style={{
                                                                    fontSize: '32px',
                                                                    cursor: 'pointer',
                                                                    color: star <= reviewForm.Grade ? '#ffc107' : '#ddd',
                                                                    transition: 'all 0.2s ease',
                                                                    textShadow: star <= reviewForm.Grade ? '0 0 5px rgba(255,193,7,0.5)' : 'none',
                                                                    transform: star <= reviewForm.Grade ? 'scale(1.1)' : 'scale(1)'
                                                                }}
                                                                onMouseEnter={(e) => {
                                                                    e.target.style.transform = 'scale(1.2)';
                                                                    if (star > reviewForm.Grade) {
                                                                        e.target.style.color = '#ffc107';
                                                                    }
                                                                }}
                                                                onMouseLeave={(e) => {
                                                                    e.target.style.transform = star <= reviewForm.Grade ? 'scale(1.1)' : 'scale(1)';
                                                                    if (star > reviewForm.Grade) {
                                                                        e.target.style.color = '#ddd';
                                                                    }
                                                                }}
                                                            >
                                                                ★
                                                            </span>
                                                        ))}
                                                    </div>
                                                </div>
                                                <div style={{ marginBottom: '20px' }}>
                                                    <label style={{ 
                                                        display: 'block', 
                                                        marginBottom: '10px', 
                                                        fontWeight: '600',
                                                        fontSize: '15px',
                                                        color: '#495057'
                                                    }}>
                                                        Текст отзыва:
                                                    </label>
                                                    <textarea
                                                        value={reviewForm.Review}
                                                        onChange={(e) => setReviewForm({ ...reviewForm, Review: e.target.value })}
                                                        placeholder="Поделитесь своими впечатлениями о книге..."
                                                        maxLength={1000}
                                                        style={{
                                                            width: '100%',
                                                            minHeight: '120px',
                                                            padding: '12px',
                                                            border: '2px solid #dee2e6',
                                                            borderRadius: '8px',
                                                            fontSize: '14px',
                                                            fontFamily: 'inherit',
                                                            resize: 'vertical',
                                                            transition: 'border-color 0.3s ease'
                                                        }}
                                                        onFocus={(e) => {
                                                            e.target.style.borderColor = '#007bff';
                                                            e.target.style.boxShadow = '0 0 0 3px rgba(0,123,255,0.1)';
                                                        }}
                                                        onBlur={(e) => {
                                                            e.target.style.borderColor = '#dee2e6';
                                                            e.target.style.boxShadow = 'none';
                                                        }}
                                                    />
                                                    <div style={{ 
                                                        marginTop: '5px',
                                                        fontSize: '12px',
                                                        color: '#6c757d',
                                                        textAlign: 'right'
                                                    }}>
                                                        {reviewForm.Review.length}/1000 символов
                                                    </div>
                                                </div>
                                                <button
                                                    onClick={handleSubmitReview}
                                                    disabled={submittingReview || !currentUser}
                                                    style={{
                                                        padding: '12px 30px',
                                                        backgroundColor: submittingReview || !currentUser ? '#6c757d' : '#28a745',
                                                        color: 'white',
                                                        border: 'none',
                                                        borderRadius: '8px',
                                                        cursor: submittingReview || !currentUser ? 'not-allowed' : 'pointer',
                                                        fontSize: '15px',
                                                        fontWeight: '600',
                                                        transition: 'all 0.3s ease',
                                                        boxShadow: submittingReview || !currentUser ? 'none' : '0 2px 6px rgba(40,167,69,0.3)',
                                                        width: '100%'
                                                    }}
                                                    onMouseEnter={(e) => {
                                                        if (!submittingReview && currentUser) {
                                                            e.target.style.backgroundColor = '#218838';
                                                            e.target.style.transform = 'translateY(-1px)';
                                                        }
                                                    }}
                                                    onMouseLeave={(e) => {
                                                        if (!submittingReview && currentUser) {
                                                            e.target.style.backgroundColor = '#28a745';
                                                            e.target.style.transform = 'translateY(0)';
                                                        }
                                                    }}
                                                >
                                                    {submittingReview ? '⏳ Отправка...' : currentUser ? '✓ Отправить отзыв' : '🔒 Войдите, чтобы оставить отзыв'}
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                    
                                    {/* Список отзывов */}
                                    {loading ? (
                                        <p style={{ textAlign: 'center', padding: '20px' }}>Загрузка отзывов...</p>
                                    ) : reviews.length === 0 ? (
                                        <div style={{
                                            textAlign: 'center',
                                            padding: '40px 20px',
                                            color: '#6c757d',
                                            backgroundColor: '#f8f9fa',
                                            borderRadius: '8px',
                                            border: '1px dashed #dee2e6'
                                        }}>
                                            <p style={{ fontSize: '16px', marginBottom: '10px' }}>
                                                📚 Пока нет отзывов
                                            </p>
                                            <p style={{ fontSize: '14px', margin: 0 }}>
                                                Будьте первым, кто оставит отзыв на эту книгу!
                                            </p>
                                        </div>
                                    ) : (
                                        <div className="reviews_list">
                                            {reviews.map((review) => (
                                                <div key={review.ID} className="review_item" style={{ 
                                                    marginBottom: '30px', 
                                                    paddingBottom: '20px', 
                                                    paddingTop: '20px',
                                                    borderBottom: '1px solid #eee',
                                                    backgroundColor: '#fafafa',
                                                    padding: '20px',
                                                    borderRadius: '5px'
                                                }}>
                                                    <div className="review_header" style={{ marginBottom: '15px' }}>
                                                        <div className="review_author" style={{ 
                                                            fontWeight: 'bold', 
                                                            marginBottom: '8px',
                                                            fontSize: '16px',
                                                            color: '#333'
                                                        }}>
                                                            {getUserName(review.id_User)}
                                                        </div>
                                                        <div className="review_rating" style={{ 
                                                            marginBottom: '10px',
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            gap: '10px'
                                                        }}>
                                                            <RatingStar maxScore={5} rating={review.Grade} id={`rating-${review.ID}`} />
                                                            <span style={{ color: '#666', fontSize: '14px' }}>
                                                                {review.Grade.toFixed(1)} из 5
                                                            </span>
                                                        </div>
                                                    </div>
                                                    {review.Review && review.Review.trim() ? (
                                                        <div className="review_text" style={{ 
                                                            whiteSpace: 'pre-wrap', 
                                                            lineHeight: '1.8', 
                                                            color: '#333',
                                                            fontSize: '14px',
                                                            marginBottom: '10px'
                                                        }}>
                                                            {review.Review}
                                                        </div>
                                                    ) : (
                                                        <div style={{ color: '#999', fontStyle: 'italic', fontSize: '14px' }}>
                                                            Отзыв без текста
                                                        </div>
                                                    )}
                                                    <div className="review_date" style={{ 
                                                        marginTop: '10px', 
                                                        fontSize: '12px', 
                                                        color: '#999'
                                                    }}>
                                                        {review.created_at ? new Date(review.created_at).toLocaleDateString('ru-RU', {
                                                            year: 'numeric',
                                                            month: 'long',
                                                            day: 'numeric'
                                                        }) : ''}
                                                    </div>
                                                </div>
                                        ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}

export default ProductInfo