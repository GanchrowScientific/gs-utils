#include <math.h>
#include "betadist.h"
#include "normaldist.h"
#include "tdist.h"

/* TINV COEFFICIENTS */
const double coef[4][5] = {
  1.0e0,1.0e0,0.0e0,0.0e0,0.0e0,3.0e0,16.0e0,5.0e0,0.0e0,0.0e0,-15.0e0,17.0e0,
  19.0e0,3.0e0,0.0e0,-945.0e0,-1920.0e0,1482.0e0,776.0e0,79.0e0
};

const double denom[4] = {
  4.0e0,96.0e0,384.0e0,92160.0e0
};

const int ideg[4] = { 2,3,4,5 };

const long int iter = 1e6;
const double eps = 1e-6;
/********************/

double student_cdf ( double t, double df, double a, double b )

/******************************************************************************/
/*
  Purpose:

    STUDENT_CDF evaluates the central Student T CDF.

  Licensing:

    This code is distributed under the GNU LGPL license.

  Modified:

    02 November 2005

  Author:

    John Burkardt

  Parameters:

    Input, double X, the argument of the CDF.

    Input, double A, B, shape parameters of the PDF,
    used to transform the argument X to a shifted and scaled
    value Y = ( X - A ) / B.  It is required that B be nonzero.
    For the standard distribution, A = 0 and B = 1.

    Input, double C, is usually called the number of
    degrees of freedom of the distribution.  C is typically an
    integer, but that is not essential.  It is required that
    C be strictly positive.

    Output, double STUDENT_CDF, the value of the CDF.
*/
{
  double a2;
  double b2;
  double c2;
  double cdf;
  double y;

  y = ( t - a ) / b;

  a2 = 0.5 * df;
  b2 = 0.5;
  c2 = df / ( df + y * y );

  if ( y <= 0.0 )
  {
    cdf = 0.5 * beta_inc ( a2, b2, c2 );
  }
  else
  {
    cdf = 1.0 - 0.5 * beta_inc ( a2, b2, c2 );
  }

  return cdf;
}

double t_cdf( double t, double df ) {
  return student_cdf( t, df, 0.0, 1.0 );
}

double t_pdf( double t, double df ) {
  return pow(1 + t*t / df, -(df+1)/2) / (sqrt(df) * beta(0.5, df/2.0));
}

double inverse_t_expanded( double qn, double df ) {
  double v = (qn-0.5)*(sqrt(df*PI)*(tgamma(df*0.5))/(tgamma((df+1)*0.5)));
  double res = 0e0, o_res = 0e0;

  int k = 0;

  while((k++)<iter) {
    res += pow(v, 2.0*k + 1.0); // missing coefficient here
    if( fabs(res - o_res) < eps ) break;
    o_res = res;
  }
  return res + v;
}


double inverse_t ( double qn, double df ){
  if(qn < 0.0 || 1.0 < qn) return NASNF;
  if(qn == half) return 0.0;

  double dt1,denpow,sum,term,x,xp,xx;
  int i, j;

  x = fabs(inverse_normal(qn));
  xx = x*x;
  sum = x;
  denpow = 1.0e0;
  for ( i = 0; i < 4; i++ )
  {
      term = coef[i][0];
      for(j=1; j<ideg[i]; j++) {
        term = coef[i][j] + term * xx;
      }
      denpow *= df;
      sum += ((term*x)/(denpow*denom[i]));
  }
  if(!(qn >= 0.5e0)) goto S20;
  xp = sum;
  goto S30;
  S20:
    xp = -sum;
  S30:
    dt1 = xp;
    return dt1;
}
