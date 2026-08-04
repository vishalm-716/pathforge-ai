const fs = require('fs');
const https = require('https');

const urls = [
  "https://www.youtube.com/watch?v=_uQrJ0TkZlc",
  "https://www.youtube.com/watch?v=0ik6X4DJKCc",
  "https://www.youtube.com/watch?v=0ZJgIjIuY7U",
  "https://www.youtube.com/watch?v=1XAfapkBQjk",
  "https://www.youtube.com/watch?v=2Fn0WAyZV0E",
  "https://www.youtube.com/watch?v=3a0I8ICR1Vg",
  "https://www.youtube.com/watch?v=3dt4OGnU5sM",
  "https://www.youtube.com/watch?v=4Oi5xpjoCRk",
  "https://www.youtube.com/watch?v=5LrDIWkK_Bc",
  "https://www.youtube.com/watch?v=6iF8Xb7Z3wQ",
  "https://www.youtube.com/watch?v=6ThXsUwLWvc",
  "https://www.youtube.com/watch?v=7GwptabrYyk",
  "https://www.youtube.com/watch?v=7nafaH9SddU",
  "https://www.youtube.com/watch?v=7S_tz1z_5bA",
  "https://www.youtube.com/watch?v=8DvywoWv6fI",
  "https://www.youtube.com/watch?v=9D1x7-2FmTA",
  "https://www.youtube.com/watch?v=9Os0o3wzS_I",
  "https://www.youtube.com/watch?v=9WmRFoSdqKE",
  "https://www.youtube.com/watch?v=9yeOJ0ZMUYw",
  "https://www.youtube.com/watch?v=apACNr7DC_s",
  "https://www.youtube.com/watch?v=aZGzwEjZrXc",
  "https://www.youtube.com/watch?v=BGTx91t8q50",
  "https://www.youtube.com/watch?v=drQK8ciCAjY",
  "https://www.youtube.com/watch?v=ei_4Nt7XWOw",
  "https://www.youtube.com/watch?v=Ej_02ICOIgs",
  "https://www.youtube.com/watch?v=ENrzD9HAZK4",
  "https://www.youtube.com/watch?v=fgTGADljAeg",
  "https://www.youtube.com/watch?v=GdAon80-0KA",
  "https://www.youtube.com/watch?v=hdI2bqOjy3c",
  "https://www.youtube.com/watch?v=HXV3zeQKqGY",
  "https://www.youtube.com/watch?v=I37kGX-nZEI",
  "https://www.youtube.com/watch?v=jORThkew-74",
  "https://www.youtube.com/watch?v=K1iu1kXkVoA",
  "https://www.youtube.com/watch?v=L72fhGm1tfE",
  "https://www.youtube.com/watch?v=m1KcNV-Zhmc",
  "https://www.youtube.com/watch?v=MK-NZ4hN7rs",
  "https://www.youtube.com/watch?v=n60Dn0UsbEk",
  "https://www.youtube.com/watch?v=N8ap4k_1QEQ",
  "https://www.youtube.com/watch?v=NTHVTY6w2Co",
  "https://www.youtube.com/watch?v=nZ1DMMsyVyI",
  "https://www.youtube.com/watch?v=O6P86uwfdR0",
  "https://www.youtube.com/watch?v=Oe421EPjeBE",
  "https://www.youtube.com/watch?v=oigfaZ5ApsM",
  "https://www.youtube.com/watch?v=okr-XE8yTO8",
  "https://www.youtube.com/watch?v=On03HWe2tZM",
  "https://www.youtube.com/watch?v=p3qvj9hO_Bo",
  "https://www.youtube.com/watch?v=P3YID7liBug",
  "https://www.youtube.com/watch?v=pkkFqlG0Hds",
  "https://www.youtube.com/watch?v=PoRJizFvM7s",
  "https://www.youtube.com/watch?v=qjjF3_jMYlA",
  "https://www.youtube.com/watch?v=QpdhBUYk7Kk",
  "https://www.youtube.com/watch?v=TlB_eWDSMt4",
  "https://www.youtube.com/watch?v=w7ejDZ8SWv8",
  "https://www.youtube.com/watch?v=W8KRzm-HUcc",
  "https://www.youtube.com/watch?v=ztHopE5Wnpc",
  "https://www.youtube.com/watch?v=ZYnp_SQm09A"
];

async function fetchDuration(url) {
  return new Promise((resolve) => {
    https.get(url, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        // Look for "lengthSeconds":"123"
        const match = data.match(/"lengthSeconds":"(\d+)"/);
        if (match && match[1]) {
          resolve(Math.ceil(parseInt(match[1]) / 60)); // Return minutes
        } else {
          // Some videos might not have lengthSeconds easily available if they are live or weird
          resolve(null);
        }
      });
    }).on('error', () => resolve(null));
  });
}

async function main() {
  const results = {};
  for (const url of urls) {
    const mins = await fetchDuration(url);
    if (mins) {
      results[url] = mins;
      console.log(`${url} -> ${mins} minutes`);
    } else {
      console.log(`${url} -> NOT FOUND`);
    }
  }
  fs.writeFileSync('youtube-durations.json', JSON.stringify(results, null, 2));
}

main();
