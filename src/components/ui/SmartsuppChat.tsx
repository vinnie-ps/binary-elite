'use client'

import Script from 'next/script'

export function SmartsuppChat() {
    return (
        <>
            <Script id="smartsupp-chat" strategy="afterInteractive">
                {`
                    var _smartsupp = _smartsupp || {};
                    _smartsupp.key = '753b113918561a83558bf38031e49366bde05d3f';
                    window.smartsupp||(function(d) {
                        var s,c,o=smartsupp=function(){ o._.push(arguments)};o._=[];
                        s=d.getElementsByTagName('script')[0];c=d.createElement('script');
                        c.type='text/javascript';c.charset='utf-8';c.async=true;
                        c.src='https://www.smartsuppchat.com/loader.js?';s.parentNode.insertBefore(c,s);
                    })(document);
                `}
            </Script>
        </>
    )
}
