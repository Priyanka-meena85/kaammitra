export const loadRazorpayScript = () => {
    return new Promise((resolve) => {
        const scriptId = 'razorpay-checkout-js';
        
        if (document.getElementById(scriptId)) {
            resolve(true);
            return;
        }

        const script = document.createElement('script');
        script.id = scriptId;
        script.src = 'https://checkout.razorpay.com/v1/checkout.js';
        script.onload = () => {
            resolve(true);
        };
        script.onerror = () => {
            resolve(false);
        };
        document.body.appendChild(script);
    });
};
