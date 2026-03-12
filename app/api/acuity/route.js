import { NextResponse } from "next/server";

const ACUITY_BASE = "https://acuityscheduling.com/api/v1";

async function acuityGet(endpoint) {
  const credentials = Buffer.from(
    `${process.env.ACUITY_USER_ID}:${process.env.ACUITY_API_KEY}`
import { NextResponse } from "next/server";
  
  const ACUITY_BASE = "https://acuityscheduling.com/api/v1";
  
  // Pricing map — matches Acuity appointment type names to dollar amounts
  const PRICE_MAP = {
      "Private Session": 130,
      "Back to Back Private Session": 205,
      "Group Training": 205,
      "Student Athlete Session": 105,
      "Senior 30min": 70,
      "Senior 60min": 130,
  };
  
  function getPriceForAppointment(appt) {
      // Match by appointment type name (Acuity returns 'type' as the type name)
      for (const [key, price] of Object.entries(PRICE_MAP)) {
            if (appt.type && appt.type.toLowerCase().includes(key.toLowerCase())) {
                    return price;
            }
      }
      // Default to private session rate if no match
      return 130;
  }
  
  async function acuityGet(endpoint) {
      const credentials = Buffer.from(
            `${process.env.ACUITY_USER_ID}:${process.env.ACUITY_API_KEY}`
          ).toString("base64");

      const res = await fetch(`${ACUITY_BASE}${endpoint}`, {
            headers: { Authorization: `Basic ${credentials}` },
      });
      if (!res.ok) {
            throw new Error(`Acuity API error: ${res.status}`);
      }
          return res.json();
  }

  export async function GET() {
      if (!process.env.ACUITY_USER_ID || !process.env.ACUITY_API_KEY) {
            return NextResponse.json(
              { error: "Acuity credentials not configured", connected: false },
              { status: 503 }
                  );
      }

          try {
                const now = new Date();

                // Week boundaries (Mon-Sun)
                const day = now.getDay();
                const mondayOffset = day === 0 ? -6 : 1 - day;
                const monday = new Date(now);
                monday.setDate(now.getDate() + mondayOffset);
                monday.setHours(0, 0, 0, 0);
                const sunday = new Date(monday);
                sunday.setDate(monday.getDate() + 6);
                sunday.setHours(23, 59, 59, 999);

                // Month boundaries for projected reviemnpuoer
            t   {   NceoxntsRte smpoonntsheS t}a rftr o=m  n"enwe xDta/tsee(rnvoewr."g;e
            t
            FcuolnlsYte aArC(U)I,T Yn_oBwA.SgEe t=M o"nhttht(p)s,: /1/)a;c
              u i t y sccohnesdtu lmionngt.hcEonmd/ a=p in/evw1 "D;a
            t
            e/(/n oPwr.igceitnFgu lmlaYpe a— rm(a)t,c hneosw .AgceutiMtoyn tahp(p)o i+n t1m,e n0t) ;t
               y p e   nmaomnetsh Etnod .dsoeltlHaoru rasm(o2u3n,t s5
                                                           9c,o n5s9t,  P9R9I9C)E;_
            M
            A P   =  c{o
                       n s t" PwreievkaSttea rSte s=s imoonn"d:a y1.3t0o,I
                       S O S"tBraicnkg (t)o. sBpalcikt (P"rTi"v)a[t0e] ;S
                         e s s i ocno"n:s t2 0w5e,e
                         k E n"dG r=o uspu nTdraayi.ntionIgS"O:S t2r0i5n,g
                       ( ) ."sSptluidte(n"tT "A)t[h0l]e;t
                         e   S e scsoinosnt" :t o1d0a5y, 
                         =   n"oSwe.ntiooIrS O3S0tmriinn"g:( )7.0s,p
                       l i t"(S"eTn"i)o[r0 ]6;0
                         m i n " :c o1n3s0t, 
                         m}S;t
            a
            rftu n=c tmioonnt hgSettaPrrti.cteoFIoSrOASptproiinngt(m)e.nstp(laiptp(t")T "{)
              [ 0 ]/;/
                  M a t ccho nbsyt  ampEpnodi n=t mmeonntt htEynpde. tnoaImSeO S(tArciunigt(y) .rseptluirtn(s" T'"t)y[p0e]'; 
                    a
              s   t h e/ /t yFpeet cnha mwee)e
              k   sfeosrs i(ocnosn,s tu p[ckoemyi,n gp rsiecses]i oonfs ,O bajnedc tA.LeLn trreimeasi(nPiRnIgC Em_oMnAtPh) )a p{p
                                                                                                                                o i n t miefn t(sa pipnt .ptayrpael l&e&l 
                                                                                                                                a p p t .ctoynpset. t[owLeoewkeArpCpatsse,( )u.picnocmliundge,s (mkoenyt.htAopLpotwse]r C=a saew(a)i)t)  P{r
                                                                                                                                                                                                                                           o m i s e . arlelt(u[r
                                                                                                                                                                                                                                                              n   p r i c ea;c
                                                                                                                                                                                                                                           u i t y G}e
                                                                                                                                t ( `}/
                                                                                                                                a p p/o/i nDtemfeanutlst? mtion Dpartiev=a$t{ew eseeksSstiaornt }r&amtaex Diaft en=o$ {mwaeteckhE
                                                                                                                                n d }r&emtauxr=n1 0103`0);,
                                                                                                                                
                                                                                                                                } 

               a s y nacc ufiutnycGteito(n` /aacpupiotiynGtemte(netnsd?pmoiinnDta)t e{=
               $ { tcoodnasyt} &cmraexd=e2n0t&idailrse c=t iBounf=fAeSrC.`f)r,o
              m ( 
                        a`c$u{iptryoGceets(s`./eanpvp.oAiCnUtImTeYn_tUsS?EmRi_nIDDa}t:e$={$p{rtoocdeasys}.&emnavx.DAaCtUeI=T$Y{_mAEPnId_}K&EmYa}x`=
                        1 0 0)&.dtiorSetcrtiinogn(="AbSaCs`e)6,4
    " ) ; 

    ] ) ;c
    o
    n s t   rceosn s=t  awweaeiktS efsesticohn(s` $={ AwCeUeIkTAYp_pBtAsS.Ef}i$l{teenrd(p(oai)n t=}>` ,! a{.
                                               c a n c ehleeadd)e.rlse:n g{t hA;u
                                                                           t
                                                                           h o r i zcaotnisotn :u p`cBoamsiincg L$i{sctr e=d eunptcioamlisn}g`
                                                                          } , 
  }.)f;i
  l t eirf( ((a!)r e=s>. o!ka). c{a
           n c e l etdh)r
                                  o w   n e w  .Esrlriocre((`0A,c u1i0t)y
                                    A P I   e r.rmoarp:( ($a{)r e=s>. s(t{a
                                    t u s } ` ) ; 
                                                             i d}:
    a .riedt,u
  r n   r e s . j scolni(e)n;t
  :} 
`
$e{xap.ofritr satsNyanmce }f u$n{cat.iloans tGNEaTm(e)} `{,

      i f   ( ! p rtoycpees:s .ae.ntvy.pAeC,U
  I T Y _ U S E R _dIaDt e|:|  a!.pdraotcee,s
  s . e n v . A C UtIiTmYe_:A PaI._tKiEmYe), 
  { 
             r e tpurrinc eN:e xgteRtePsrpiocnesFeo.rjAspopno(i
                                                              n t m e n t ({a )e,r
               r o r :   " A}c)u)i;t
               y
                 c r e d/e/n tCiaallcsu lnaotte  cpornofjiegcutreedd "r,e mcaoinnniencgt erde:v efnaules ef r}o,m
                     s c h e d u{l esdt aatpupso:i n5t0m3e n}t
    s   t h i)s; 
    m o n}t
  h

      t r yc o{n
               s t   r ecmoanisnti nngoAwp p=t sn e=w  mDoantteh(A)p;p
               t
               s . f i l/t/e rW(e(eak)  b=o>u n!daa.rciaensc e(lMeodn)-;S
               u n ) 
                 c o n scto npsrto jdeacyt e=d Rneomwa.igneitnDga y=( )r;e
               m a i n icnognAsptp tmso.nrdeadyuOcfef(s(estu m=,  daa)y  ==>= ={ 
                 0   ?   - 6  r:e t1u r-n  dsauym; 
               +   g e tcPorniscte FmoornAdpapyo i=n tnmeewn tD(aat)e;(
                 n o w ) ;}
  ,   0 ) ;m
  o
  n d a y ./s/e tSDeastsei(onno wc.oguenttD abtree(a)k d+o wmno nfdoary Orfefmsaeitn)i;n
  g   m o nmtohn
  d a y . sceotnHsotu rrse(m0a,i n0i,n g0S,e s0s)i;o
  n C o u ncto n=s tr esmuanidnaiyn g=A pnpetws .Dlaetneg(tmho;n
                                                          d
  a y ) ; 
  r e t u rsnu nNdeaxyt.RseestpDoantsee(.mjosnodna(y{.
                                                   g e t D a t ew(e)e k+S e6s)s;i
  o n s , 
    s u n d a y .uspectoHmoiunrgs:( 2u3p,c o5m9i,n g5L9i,s t9,9
  9 ) ; 

      p r o/j/e cMtoendtRhe mbaoiunnidnagr,i
  e s   f o r  rpermoajiencitnegdS ersesvieonnuCeo
  u n t , 
    c o n s t   mloanstthFSettacrhte d=:  nneeww  DDaattee((n)o.wt.ogIeStOFSutlrliYnega(r)(,)
                                                           ,   n o w . gceotnMnoenctthe(d):,  t1r)u;e
  , 
          c o}n)s;t
  m o}n tchaEtncdh  =( enrerwo rD)a t{e
                                      ( n o w .cgoentsFoullel.Yeerarro(r)(," Ancouwi.tgye tAMPoIn tehr(r)o r+: "1,,  e0r)r;o
                                      r . m e smsoangteh)E;n
                                      d . s e trHeotuurrsn( 2N3e,x t5R9e,s p5o9n,s e9.9j9s)o;n
                                      (

                                                c o n{s te rwreoerk:S tearrrto r=. mmeosnsdaagye.,t ocIoSnOnSetcrtiendg:( )f.aslpslei t}(,"
                                                                                                                                         T " ) [ 0 ] ;{
                                          s t a tcuosn:s t5 0w0e e}k
E n d   =) ;s
u n d}a
y}.toISOString().split("T")[0];
    const today = now.toISOString().split("T")[0];
    const mStart = monthStart.toISOString().split("T")[0];
    const mEnd = monthEnd.toISOString().split("T")[0];

    // Fetch week sessions, upcoming sessions, and ALL remaining month appointments in parallel
    const [weekAppts, upcoming, monthAppts] = await Promise.all([
            acuityGet(`/appointments?minDate=${weekStart}&maxDate=${weekEnd}&max=100`),
            acuityGet(`/appointments?minDate=${today}&max=20&direction=ASC`),
            acuityGet(`/appointments?minDate=${today}&maxDate=${mEnd}&max=100&direction=ASC`),
          ]);

    const weekSessions = weekAppts.filter((a) => !a.canceled).length;

    const upcomingList = upcoming
      .filter((a) => !a.canceled)
      .slice(0, 10)
      .map((a) => ({
                id: a.id,
                client: `${a.firstName} ${a.lastName}`,
                type: a.type,
                date: a.date,
                time: a.time,
                price: getPriceForAppointment(a),
      }));

    // Calculate projected remaining revenue from scheduled appointments this month
    const remainingAppts = monthAppts.filter((a) => !a.canceled);
    const projectedRemaining = remainingAppts.reduce((sum, a) => {
            return sum + getPriceForAppointment(a);
    }, 0);

    // Session count breakdown for remaining month
    const remainingSessionCount = remainingAppts.length;

    return NextResponse.json({
            weekSessions,
            upcoming: upcomingList,
            projectedRemaining,
            remainingSessionCount,
            lastFetched: new Date().toISOString(),
            connected: true,
    });
} catch (error) {
      console.error("Acuity API error:", error.message);
      return NextResponse.json(
        { error: error.message, connected: false },
        { status: 500 }
            );
}
}
      ).toString("base64");

  const res = await fetch(`${ACUITY_BASE}${endpoint}`, {
    headers: { Authorization: `Basic ${credentials}` },
  });
  if (!res.ok) {
    throw new Error(`Acuity API error: ${res.status}`);
  }
  return res.json();
}

export async function GET() {
  if (!process.env.ACUITY_USER_ID || !process.env.ACUITY_API_KEY) {
    return NextResponse.json(
      { error: "Acuity credentials not configured", connected: false },
      { status: 503 }
    );
  }

  try {
    // Calculate week boundaries (Monday–Sunday)
    const now = new Date();
    const day = now.getDay();
    const mondayOffset = day === 0 ? -6 : 1 - day;
    const monday = new Date(now);
    monday.setDate(now.getDate() + mondayOffset);
    monday.setHours(0, 0, 0, 0);

    const sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 6);
    sunday.setHours(23, 59, 59, 999);

    const weekStart = monday.toISOString().split("T")[0];
    const weekEnd = sunday.toISOString().split("T")[0];
    const today = now.toISOString().split("T")[0];

    // Fetch this week's sessions and upcoming in parallel
    const [weekAppts, upcoming] = await Promise.all([
      acuityGet(`/appointments?minDate=${weekStart}&maxDate=${weekEnd}&max=100`),
      acuityGet(`/appointments?minDate=${today}&max=20&direction=ASC`),
    ]);

    const weekSessions = weekAppts.filter((a) => !a.canceled).length;

    const upcomingList = upcoming
      .filter((a) => !a.canceled)
      .slice(0, 10)
      .map((a) => ({
        id: a.id,
        client: `${a.firstName} ${a.lastName}`,
        type: a.type,
        date: a.date,
        time: a.time,
      }));

    return NextResponse.json({
      weekSessions,
      upcoming: upcomingList,
      lastFetched: new Date().toISOString(),
      connected: true,
    });
  } catch (error) {
    console.error("Acuity API error:", error.message);
    return NextResponse.json(
      { error: error.message, connected: false },
      { status: 500 }
    );
  }
}
