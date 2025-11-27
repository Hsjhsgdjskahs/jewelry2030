
import { useState, useCallback, useEffect } from 'react';
import { UserActivityType, VipLevel } from '../types';

export const VIP_THRESHOLDS = {
    Bronze: 50,
    Silver: 150,
    Gold: 300,
};

const ACTIVITY_SCORE = {
    view: 1,
    wishlist: 5,
    cart: 10,
};

const getUserScore = (): number => {
    try {
        const score = localStorage.getItem('bayani_user_score');
        return score ? parseInt(score, 10) : 0;
    } catch {
        return 0;
    }
};

export const useUserActivity = () => {
    const [score, setScore] = useState(getUserScore);
    const [vipLevel, setVipLevel] = useState<VipLevel>('None');

    const trackActivity = useCallback((type: UserActivityType) => {
        setScore(prevScore => {
            const newScore = prevScore + (ACTIVITY_SCORE[type] || 0);
            localStorage.setItem('bayani_user_score', newScore.toString());
            return newScore;
        });
    }, []);

    useEffect(() => {
        if (score >= VIP_THRESHOLDS.Gold) {
            setVipLevel('Gold');
        } else if (score >= VIP_THRESHOLDS.Silver) {
            setVipLevel('Silver');
        } else if (score >= VIP_THRESHOLDS.Bronze) {
            setVipLevel('Bronze');
        } else {
            setVipLevel('None');
        }
    }, [score]);

    return { vipLevel, trackActivity };
};
