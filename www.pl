#!/usr/bin/perl
use strict;
use warnings;

use Path::Class;
use autodie; # die if problem reading or writing a file






my $dir = dir("/Users/l/Documents/testpython/analysis"); # /tmp
my $file = $dir->file("index.html");
my $body = $file->slurp();

$body =~ s/\\//gs;
my ($cipher_id) = ($body =~ m@/jsbin\\?/((?:html5)?player-.+?)\.js@s);

  $cipher_id =~ s@\\@@gs;
  my $url = "https://s.ytimg.com/yts/jsbin/$cipher_id.js";
my $dir1 = dir("/Users/l/Documents/testpython/analysis/en_US-vflk2jRfn"); # /tmp
my $file1 = $dir1->file("base.js");
 $body = $file1->slurp();

  my $v = '[\$a-zA-Z][a-zA-Z\d]*';  # JS variable

  $v = "$v(?:\.$v)?";   # Also allow "a.b" where "a" would be used as a var.


  # First, find the sts parameter:
  my ($sts) = ($body =~ m/\bsts:(\d+)\b/si);
  errorI ("$cipher_id: no sts parameter: $url") unless $sts;


  # Since the script is minimized and obfuscated, we can't search for
  # specific function names, since those change. Instead we match the
  # code structure.
  #
  # Note that the obfuscator sometimes does crap like y="split",
  # so a[y]("") really means a.split("")


  # Find "C" in this: var A = B.sig || C (B.s)
  my (undef, $fn) = ($body =~ m/$v = ( $v ) \.sig \|\| ( $v ) \( \1 \.s \)/sx);

  # If that didn't work:
  # Find "C" in this: A.set ("signature", C (d));
  ($fn) = ($body =~ m/ $v \. set \s* \( "signature", \s*
                                        ( $v ) \s* \( \s* $v \s* \) /sx)
    unless $fn;

  errorI ("$cipher_id: unparsable cipher js: $url") unless $fn;

  # Find body of function C(D) { ... }
  # might be: var C = function(D) { ... }
  # might be:   , C = function(D) { ... }
  my ($fn2) = ($body =~ m@\b function \s+ \Q$fn\E \s* \( $v \)
                          \s* { ( .*? ) } @sx);
     ($fn2) = ($body =~ m@(?: \b var \s+ | [,;] \s* )
                          \Q$fn\E \s* = \s* function \s* \( $v \)
                          \s* { ( .*? ) } @sx)
       unless $fn2;

  errorI ("$cipher_id: unparsable fn \"$fn\"") unless $fn2;

  $fn = $fn2;

  # They inline the swapper if it's used only once.
  # Convert "var b=a[0];a[0]=a[63%a.length];a[63]=b;" to "a=swap(a,63);".
  $fn2 =~ s@
            var \s ( $v ) = ( $v ) \[ 0 \];
            \2 \[ 0 \] = \2 \[ ( \d+ ) % \2 \. length \];
            \2 \[ \3 \]= \1 ;
           @$2=swap($2,$3);@sx;

  my @cipher = ();
  foreach my $c (split (/\s*;\s*/, $fn2)) {
    if      ($c =~ m@^ ( $v ) = \1 . $v \(""\) $@sx) {         # A=A.split("");
    } elsif ($c =~ m@^ ( $v ) = \1 .  $v \(\)  $@sx) {         # A=A.reverse();
      push @cipher, "r";
    } elsif ($c =~ m@^ ( $v ) = \1 . $v \( (\d+) \) $@sx) {    # A=A.slice(N);
      push @cipher, "s$2";

    } elsif ($c =~ m@^ ( $v ) = ( $v ) \( \1 , ( \d+ ) \) $@sx ||  # A=F(A,N);
             $c =~ m@^ (    )   ( $v ) \( $v , ( \d+ ) \) $@sx) {  # F(A,N);
      my $f = $2;
      my $n = $3;
      $f =~ s/^.*\.//gs;  # C.D => D
      # Find function D, of the form: C={ ... D:function(a,b) { ... }, ... }
      my ($fn3) = ($body =~ m@ \b \Q$f\E: \s*
                               function \s* \( .*? \) \s*
                                ( { [^{}]+ } )
                             @sx);
      # Look at body of D to decide what it is.
      if ($fn3 =~ m@ var \s ( $v ) = ( $v ) \[ 0 \]; @sx) {  # swap
        push @cipher, "w$n";
      } elsif ($fn3 =~ m@ \b $v \. reverse\( @sx) {          # reverse
        push @cipher, "r";
      } elsif ($fn3 =~ m@ return \s* $v \. slice @sx ||      # slice
               $fn3 =~ m@ \b $v \. splice @sx) {             # splice
        push @cipher, "s$n";
      } else {
        $fn =~ s/;/;\n\t    /gs;
        errorI ("unrecognized cipher body $f($n) = $fn3\n\tin: $fn");
      }
    } elsif ($c =~ m@^ return \s+ $v \. $v \(""\) $@sx) { # return A.join("");
    } else {
      $fn =~ s/;/;\n\t    /gs;
      errorI ("$cipher_id: unparsable: $c\n\tin: $fn");
    }
  }
  my $cipher = "$sts " . join(' ', @cipher);


   my ($signature) = '11A7E1F0D7048C3EAC2FB760388211271E626EAC0.FF261228730C4740ECB57115168A16B54EC70C766';

  return $signature unless defined ($cipher);

  my $orig = $signature;
  my @s = split (//, $signature);

  my $c = $cipher;


  $c =~ s/([^\s])([a-z])/$1 $2/gs;
  my ($stsss) = $1 if ($c =~ s/^(\d+)\s*//si);

  foreach my $c (split(/\s+/, $c)) {
    if    ($c eq '')           { }
    elsif ($c eq 'r')          { @s = reverse (@s);  }
    elsif ($c =~ m/^s(\d+)$/s) { @s = @s[$1 .. $#s]; }
    elsif ($c =~ m/^w(\d+)$/s) {
      my $a = 0;
      my $b = $1 % @s;
      ($s[$a], $s[$b]) = ($s[$b], $s[$a]);
    }
    else { errorI ("bogus cipher: $c"); }
  }

  $signature = join ('', @s);
  print "$signature\n";