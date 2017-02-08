#ifndef TDIST_H
#define TDIST_H

#include <math.h>

double inverse_t_expanded(double qn, double df);
double inverse_t(double qn, double df);
double t_pdf(double t, double df);
double t_cdf(double t, double df);

#endif
