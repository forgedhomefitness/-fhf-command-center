import { NextResponse } from "next/server";

const ACUITY_BASE = "https://acuityscheduling.com/api/v1";

async function acuityGet(endpoint) {
  const credentials = Buffer.from(
    `${process.env.ACUITY_USER_ID}:${process.env.ACUITY_API_KEY}`
import { NextResponse } from "next/server";
  
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
            cache: "no-store",
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
        
            // Month boundaries for projected revenue calculation
            const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
            coinmspto rmto n{t hNEenxdt R=e snpeown sDea t}e (fnroowm. g"enteFxutl/lsYeeravre(r)",; 
        n
          ocwo.ngsett MAoCnUtIhT(Y)_ B+A S1E,  =0 )";h
            t t p s :m/o/natchuEintdy.sscehteHdouulrisn(g2.3c,o m5/9a,p i5/9v,1 "9;9
            9
            )/;/
               
        P r i c i/n/g  Tmoadpa y—  fmoart cuhpecso mAicnugi tsye saspipoonisn
          t m e n tc otnyspte  tnoadmaeys  =t on odwo.ltloaIrS OaSmtoruinntgs(
            )c.osnpslti tP(R"ITC"E)_[M0A]P; 
        =   { 
            c o"nPsrti vwaeteek SSteasrsti o=n "m:o n1d3a0y,.
              t o I"SBOaSctkr itnog (B)a.cskp lPirti(v"aTt"e) [S0e]s;s
              i o n " :c o2n0s5t, 
              w e e"kGErnodu p=  Tsruanidnaiyn.gt"o:I S2O0S5t,r
              i n g"(S)t.usdpelnitt (A"tTh"l)e[t0e] ;S
                e s s i ocno"n:s t1 0m5o,n
                t h S"tSaerntiSotrr  3=0 mmionn"t:h S7t0a,r
                t . t"oSIeSnOiSotrr i6n0gm(i)n."s:p l1i3t0(,"
                  T}";)
          [
          0f]u;n
          c t i o nc ognesttP rmiocnetFhoErnAdpSptori n=t mmeonntt(haEpnpdt.)t o{I
            S O S/t/r iMnagt(c)h. sbpyl iatp(p"oTi"n)t[m0e]n;t
               
                                                                                 t y p e  /n/a mFee t(cAhc uwieteyk  raeptpuorinnst m'etnytpse,'  uapsc otmhien gt yspees sniaomnes),
                                                                                     a nfdo ra l(lc omnosntt h[ kaepyp,o ipnrtimceen]t so fi nO bpjaercatl.leenlt
                                                                                   r i e s (cPoRnIsCtE _[MwAePe)k)A p{p
                                                                                     t s ,   uipfc o(maipnpgt,. tmyopnet h&A&p patpsp]t .=t yapwea.itto LPorwoemriCsaes.ea(l)l.(i[n
                                                                                                                                                                                c l u d e s (akceuyi.ttyoGLeotw(e`r/Caapspeo(i)n)t)m e{n
                                                                                                                                                                                t s ? m i n Draetteu=r$n{ wpereikcSet;a
                                                                                                                                                                                r t } & m}a
                                                                                                                                                                                x D a}t
                                                                                                                                                                                e = $/{/w eDeekfEanudl}t& mtaox =p1r0i0v`a)t,e
                                                                                                                                                                                               s e s s i oanc uriattyeG eitf( `n/oa pmpaoticnht
                                                                                                                                                                                               m e nrtest?umrinn D1a3t0e;=
                                                                                                                                                                                               $}{
                                                                                                                                                                                               t
                                                                                                                                                                                               oadsayyn}c& mfauxn=c2t0i&odni raeccutiitoynG=eAtS(Ce`n)d,p
                                                                                       o i n t )   {a
                                                                                         c u ictoynGsett (c`r/eadpepnotiinatlmse n=t sB?umfifneDra.tfer=o$m{(m
                                                                                         o n t h S`t$a{rptrSotcre}s&sm.aexnDva.tAeC=U$I{TmYo_nUtShEERn_dISDt}r:}$&{mparxo=c2e0s0s`.)e,n
                                                                                         v . A C U]I)T;Y
                                                                                         _
                                                                                         A P I _ KcEoYn}s`t
                                                                                                                                                                     w e)e.ktSoeSstsriionngs( "=b awseee6k4A"p)p;t
                                                                                                                                                                       s
                                                                                                                                                                         . f iclotnesrt( (rae)s  ==>  a!waa.icta nfceetlcehd()`.$l{eAnCgUtIhT;Y
                                                                                                                                                                         _
                                                                                                                                                                         B A S E }/$/{ eCnadlpcouilnatt}e` ,p r{o
                                                                                                                                                                         j e c t ehde amdoenrtsh:  r{e vAeuntuheo rfirzoamt iAoLnL:  s`cBhaesdiucl e$d{ c(rneodne-nctainaclesl}l`e d}), 
                                                                                                                                                                           a p p o icnatcmheen:t s" ntoh-isst omroen"t,h
                                                                                                                                                                           
                                                                                                                                                                                                                    } ) ;c
                                                                                                                                                                         o
                                                                                                                                                                           n s ti fm o(n!trheSsc.hoekd)u l{e
                                                                                                                                                                             d A p p ttsh r=o wm onnetwh AEprprtosr.(f`iAlctueirt(y( aA)P I= >e r!rao.rc:a n$c{erleesd.)s;t
                                                                                                                                                                             a t u s }c`o)n;s
                                                                                                                                                                               t   m}o
                                                                                                                                                                             n t hrPertoujrenc treedsR.ejvseonnu(e) ;=
                                                                                                                      }m
                                                                                     o
                                                                                       netxhpSocrhte dauslyendcA pfputnsc.trieodnu cGeE(T((s)u m{,
                                                                                           a pipft )( !=p>r o{c
                                                                                         e s s . e n vr.eAtCuUrInT Ys_uUmS E+R _gIeDt P|r|i c!epFroorcAepspso.ienntvm.eAnCtU(IaTpYp_tA)P;I
                                                                                           _ K E Y )} ,{ 
                                                                                         0 ) ; 
                                                                                          
                                                                                         r e t u r/n/  NReexvteRneusep oanlsree.ajdsyo ne(a
                                                                                                                                          r n e d   t h{i se rmroonrt:h  "(Aacpupiotiyn tcmreendtesn tiina ltsh en opta scto)n
                                                                                           f i g u rceodn"s,t  cnoonwnMesc t=e dn:o wf.aglesteT i}m,e
                                                                                           ( ) ; 
                                                                                                                                                        {  csotnasttu se:a r5n0e3d A}p
                                                                                                                                                          p t s   =) ;m
                                                                                                                                                            o n t}h
                                                                                           S
                                                                                             c h etdruyl e{d
                                                                                               A p p t sc.ofnisltt enro(w
                                                                                                                          =   n e w  (Daa)t e=(>) ;n
                                                                                                 e
                                                                                                   w   D a t/e/( aW.edeakt ebtoiumned)a.rgieetsT i(mMeo(n)- S<u nn)o
                                                                                                     w M s 
                                                                                                         c o n s)t; 
                                                                                                           d a y   =c onnoswt. gmeotnDtahyE(a)r;n
                                                                                                             e d R e vceonnuset  =m oenadranyeOdfAfpspetts .=r eddauyc e=(=(=s u0m ,?  a-p6p t:)  1= >-  {d
                                                                                                                                                                                                          a y ; 
                                                                                                                 r ectounrsnt  smuomn d+a yg e=t Pnreiwc eDFaotreA(pnpoowi)n;t
                                                                                                                   m e n t (maopnpdta)y;.
                                                                                                           s e t D a}t,e (0n)o;w
                                                                                               .
                                                                                               g e t D a/t/e (R)e m+a imnoinndga yrOefvfesneute) ;s
                                                                                               t i l l  moonn dtahye. ssecthHeoduurlse( 0t,h i0s,  m0o,n t0h)
                                                                                                 ; 
                                                                                               c ocnosnts tr esmuanidnaiyn g=A pnpetws  D=a tmeo(nmtohnSdcahye)d;u
                                                                                                 l e d A psputnsd.afyi.lsteetrD(a
                                                                                                                                t e ( m o n d(aay). g=e>t Dnaetwe (D)a t+e (6a).;d
                                                                                                   a t e t ismuen)d.agye.tsTeitmHeo(u)r s>(=2 3n,o w5M9s,
                                                                                                       5 9 ,  )9;9
                                                                                                     9 ) ; 
                                                                                          
                                                                                         c o n s t/ /m oMnotnhtRhe mbaoiunnidnagrRieevse nfuoer  =p rroejmeacitneidn grAepvpetnsu.er ecdaulcceu(l(astuimo,n 
                                                                                           a p p t )c o=n>s t{ 
                                                                                             m o n t h S traerttu r=n  nseuwm  D+a tgee(tnPorwi.cgeeFtoFruAlplpYoeianrt(m)e,n tn(oawp.pgte)t;M
                                                                                               o n t h (}),,  01));;
                                                                                             
                                                                                             
                                                                                                     c/o/n sFto rmmoantt huEpncdo m=i nnge ws eDsastieo(nnso wf.ogre tdFiuslpllYaeya
                                                                                                       r ( ) ,  cnoonws.tg eutpMcoonmtihn(g)F o+r m1a,t t0e)d; 
                                                                                         =   u p cmoomnitnhgE
                                                                                           n d . s e t H.ofuirlst(e2r3(,( a5)9 ,= >5 9!,a .9c9a9n)c;e
                                                                                             l
                                                                                               e d ) 
                                                                                                   / /   T o d.asyl ifcoer( 0u,p c1o0m)i
                                                                                                 n g   s e s s.imoanps(
                                                                                                   ( a )   =c>o n(s{t
                                                                                                                      t o d a y   =  indo:w .at.oiIdS,O
                                                                                                                        S t r i n g ( ) .cslpileintt(N"aTm"e):[ 0`]$;{
                                                                                                                        a . f i rcsotnNsatm ew}e e$k{Sat.alrats t=N ammoen}d`a,y
                                                                                                                          . t o I S O S t rtiynpge(:) .as.ptlyipte(,"
                                                                                                                          T " ) [ 0 ] ; 
                                                                                                                            d a t ectoinmset:  wae.edkaEtnedt i=m es,u
                                                                                                                          n d a y . t o I SpOrSitcrei:n gg(e)t.PsrpilcietF(o"rTA"p)p[o0i]n;t
                                                                                                                            m e n t (cao)n,s
                                                                                                                              t   m o n t h S tdaurrtaSttiro n=:  mao.ndtuhrSattairotn.,t
                                                                                                                                o I S O S t r i nlgo(c)a.tsipolni:t (a".Tl"o)c[a0t]i;o
                                                                                                                                  n   | |  c"oInns-tH ommoen"t,h
                                                                                                                                    E n d S t r  }=) )m;o
                                                                                                   n
                                                                                                     t h E n d/./t oPIeSrO-Sctlriienngt( )r.esvpelniute( "bTr"e)a[k0d]o;w
                                                                                                       n
                                                                                                           f o r  /t/h iFse tmcohn twhe
                                                                                                             e k   a pcpoonisntt mcelnitesn,t RuepvceonmuienMga ps e=s s{i}o;n
                                                                                                               s ,   a nfdo ra l(lc omnosntt ha papptp ooifn tmmoenntthsS cihne dpualreadlAlpeplt
                                                                                                                 s )   { 
                                                                                                                   c o n s t   [cwoenesktA pnpatmse,  =u p`c$o{maipnpgt,. fmiornstthNAapmpet}s ]$ {=a papwta.ilta sPtrNoammies}e`.;a
                                                                                                                     l l ( [ 
                                                                                                                           i f   ( !accluiietnytGReetv(e`n/uaepMpaopi[nntammeen]t)s ?{m
                                                                                                                           i n D a t e = $ {cwleieeknSttRaervte}n&umeaMxaDpa[tnea=m$e{]w e=e k{E nsde}s&smiaoxn=s1:0 00`,) ,r
                                                                                                                                  e v e n u e :a c0u i}t;y
                                                                                                                   G e t ( ` / a}p
                                                                                                                   p o i n t m ecnltise?nmtiRneDvaetneu=e$M{atpo[dnaaym}e&]m.asxe=s2s0i&odnisr e+c=t i1o;n
                                                                                                                   = A S C ` ) ,c
                                                                                                                     l i e n t R eavceuniuteyMGaept[(n`a/maep]p.orienvtemneunet s+?=m igneDtaPtrei=c$e{FmoornAtphpSotianrttmSetnrt}(&ampapxtD)a;t
                                                                                                                     e = $ { m}o
                                                                                                                     n
                                                                                                                     t h E n drSettru}r&nm aNxe=x2t0R0e`s)p,o
                                                                                                                       n s e . j]s)o;n
                                                                                                                       (
                                                                                                                         { 
                                                                                                                                 c o n scto nwneeecktSeeds:s itornuse ,=
                                                                                                                         w e e k A pwpetesk.Sfeislstieorn(s(,a
                                                                                                                                                          )   = >   ! aw.eceaknTcaerlgeedt):. l1e8n,g
                                                                                                                       t h ; 
                                                                                          
                                                                                             u p c/o/m iCnagl:c uulpactoem ipnrgoFjoercmtaetdt emdo,n
                                                                                               t h   r e v e/n/u eR efvreonmu eA LpLr osjcehcetdiuolnesd  b(ansoend- coann caecltlueadl)  Aacpupiotiyn tsmcehnetdsu lteh
                                                                                                 i s   m o n tmho
                                                                                                   n t h P rcoojnesctt emdoRnetvheSncuhee,d u l e d A p p/t/s  T=o tmaoln tahlAlp pstcsh.efdiullteedr (a(pap)o i=n>t m!ean.tcsa ntcheilse dm)o;n
                                                                                                     t h 
                                                                                                           c o n s tm omnotnhtEhaPrrnoejdeRcetveednRueev,e n u e   =   m o n t h/S/c hAeldruelaeddyA phpatpsp.erneeddu c(ep(a(sstu)m
                                                                                                                                                                                                                            ,   a p p t )m o=n>t h{R
                                                                                                             e m a i n i nrgeRteuvrenn useu,m   +   g e t P r/i/c eSFtoirlAlp pcooimnitnmge n(tf(uatpuprte));
                                                                                                                                                                                                                                                   
                                                                                                                                                                                                                                                            } ,m o0n)t;h
                                                                                                             S
                                                                                                               e s s i o/n/C oRuenvte:n umeo natlhrSecahdeyd uelaerdnAepdp ttsh.ilse nmgotnht,h
                                                                                                                   ( a p p o icnltimeennttRse vienn utehBer epaaksdto)w
                                                                                                                 n :   c lcioennsttR envoewnMuse M=a pn,o
                                                                                                                   w . g e t}T)i;m
                                                                                         e ( )}; 
        c a t c hc o(nesrtr )e a{r
          n e d A prpettsu r=n  mNoenxtthRSecshpeodnuslee.djAspopnt(s
                                                                    . f i l t e r{( 
            e r r o r :  (ear)r .=m>e snseawg eD,a tceo(nan.edcatteedt:i mfea)l.sgee t}T,i
            m e ( )   <  {n oswtMast
                          u s :   5)0;0
                                } 
            c o n)s;t
                m o}n
        t}h
    EarnedRevenue = earnedAppts.reduce((sum, appt) => {
            return sum + getPriceForAppointment(appt);
    }, 0);
  
      // Remaining revenue still on the schedule this month
      const remainingAppts = monthScheduledAppts.filter(
              (a) => new Date(a.datetime).getTime() >= nowMs
                    );
      const monthRemainingRevenue = remainingAppts.reduce((sum, appt) => {
              return sum + getPriceForAppointment(appt);
      }, 0);
  
      // Format upcoming sessions for display
      const upcomingFormatted = upcoming
              .filter((a) => !a.canceled)
              .slice(0, 10)
              .map((a) => ({
                        id: a.id,
                        clientName: `${a.firstName} ${a.lastName}`,
                        type: a.type,
                        datetime: a.datetime,
                        price: getPriceForAppointment(a),
                        duration: a.duration,
                        location: a.location || "In-Home",
              }));
  
      // Per-client revenue breakdown for this month
      const clientRevenueMap = {};
      for (const appt of monthScheduledAppts) {
              const name = `${appt.firstName} ${appt.lastName}`;
              if (!clientRevenueMap[name]) {
                        clientRevenueMap[name] = { sessions: 0, revenue: 0 };
              }
              clientRevenueMap[name].sessions += 1;
              clientRevenueMap[name].revenue += getPriceForAppointment(appt);
      }
  
      return NextResponse.json({
              connected: true,
              weekSessions,
              weekTarget: 18,
              upcoming: upcomingFormatted,
              // Revenue projections based on actual Acuity schedule
              monthProjectedRevenue,       // Total all scheduled appointments this month
              monthEarnedRevenue,           // Already happened (past)
              monthRemainingRevenue,        // Still coming (future)
              monthSessionCount: monthScheduledAppts.length,
              clientRevenueBreakdown: clientRevenueMap,
      });
} catch (err) {
      return NextResponse.json(
  { error: err.message, connected: false },
  { status: 500 }
      );
}
}
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
