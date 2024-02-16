/** @type {import('next').NextConfig} */
const nextConfig = {
    distDir: 'build',
    async redirects() {
        return [
            {
                source: '/',
                destination: '/home',
                permanent: false,
            },
        ]
    },
    experimental: {
        instrumentationHook: true
    },
    webpack: (config) => {
        
        //handle as_txt, as_uri media query for importing them as a inline text or data url
        //for example:
        //import svgtxt from './book.svg?as_txt'
        //import svgurl from './book.svg?as_uri'
        //Also check global.d.ts for typescript validation
        config.module.rules.forEach((rule, i) => {
            var excludeAs = {
                not: [/as_txt/, /as_uri/]
            }
            if (rule.resourceQuery) {
                rule.resourceQuery = {
                    and: [excludeAs, rule.resourceQuery]
                }
            } else {
                rule.resourceQuery = excludeAs
            }
        })
        config.module.rules.push({
            resourceQuery: /as_txt/,
            type: 'asset/source'
        })
        config.module.rules.push({
            resourceQuery: /as_uri/,
            type: 'asset/resource'
        })

        return config
    },
}

module.exports = nextConfig
