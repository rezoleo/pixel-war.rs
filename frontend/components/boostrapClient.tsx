'use client';

import { useEffect } from 'react';

export default function BootstrapClient() {
    useEffect(() => {
        import('bootstrap/dist/js/bootstrap.bundle.min.js')
            .then(() => {
                console.log('Bootstrap has been loaded successfully.');
            })
            .catch((err) => {
                console.error('Error loading Bootstrap:', err);
            });
    }, []);

    return null;
}
