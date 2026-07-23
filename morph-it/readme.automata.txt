This archive contains pre-compiled automata built from Morph-it! and
two finite state utilities packages. All automata in this package are
compiled for the i386 platform, we can provide advice on the compilation 
process if you are on a different platform.

Pippi-automata: although we called them automata, the pippi-automata 
are more precisely transducers for the Stuttgart Finite State Transducer 
Tools [1]. They are used to analyse forms in the lexicon.

We provide two flavours of pippi-automata: pippi-automaton.a is the
uncompressed version for the fst-infl program while pippi-automaton.ca
is the compact format required by fst-infl2.

The barba-automaton is meant to be used with Jan Daciuk's FSA tools
[2]. In particular, the automaton has been compiled for the fsa_guess
program, which guesses possible lemmas and morphological features.

In our current applications, we use the barba-automaton as a backup if
the pippi-automaton in analysis mode does not find a form in the
lexicon.

The pippi- and barba- names are entirely casual, they are only meant 
to make our maintenance work harder.


[1] http://www.ims.uni-stuttgart.de/projekte/gramotron/SOFTWARE/SFST.html
[2] http://juggernaut.eti.pg.gda.pl/~jandac/home.html
