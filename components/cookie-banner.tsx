'use client'

import { useState, useEffect } from 'react'

export function CookieBanner() {
const [showBanner, setShowBanner] = useState(false)

useEffect(() => {
const consent = localStorage.getItem('cookie-consent')
if (!consent) {
setShowBanner(true)
}
}, [])

const acceptCookies = () => {
localStorage.setItem('cookie-consent', 'accepted')
setShowBanner(false)
}

const declineCookies = () => {
localStorage.setItem('cookie-consent', 'declined')
setShowBanner(false)
}

if (!showBanner) return null

return (
<div className="fixed bottom-0 left-0 right-0 z-50 bg-gray-900 text-white p-4 shadow-lg">
<div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
<p className="text-sm">
We use cookies to improve your experience on our site. By continuing, you agree to our use of cookies.
</p>
<div className="flex gap-3">
<button
onClick={declineCookies}
className="px-4 py-2 text-sm border border-gray-500 rounded hover:bg-gray-800 transition"
>
Decline
</button>
<button
onClick={acceptCookies}
className="px-4 py-2 text-sm bg-green-600 rounded hover:bg-green-700 transition"
>
Accept
</button>
</div>
</div>
</div>
)
}
