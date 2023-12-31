### 1 Components of MISOL (Overview)

MISOl consists of four major components accessible in four different tabs of the web interface. The first component defines sound classes and sound laws. The former allow to group sounds into arbitrary units, and the latter allow to define how sounds in an ancestral language change into sounds in a descendant language in a certain context. The second component allows to convert words in the ancestral language into words in the descendant language (also known as "forward reconstruction"), and the third component allows to guess from which words in the ancestral language a given word in the target language has evolved. The fourth component allows to import and export data in text form, enabling users to store their analyses, parse the data with additional software tools, or to compare different approaches to solve the same problem in phonological reconstruction. The components are summarized in Figure 1.

![Figure 1: Major components of MISOL](img/workflow.png?raw=true "Major components of MISOL"){ width=90% }

### 2 Defining Sound Classes (Tab "Classes and Laws")

The table of sound classes defines sounds in a very simple way, by assigning
one or more sounds or sound classes to a certain sound class label on each
line. Sound classes are read in from the first to the last line and definitions
are stored at the time a line is parsed. As a result, sound class assignments
can be combined, and an existing sound class can be assigned to another
class.

The assignment of one or more sounds or sound classes to a given sound class is represented in the form:

<div class="mycode">

```bash
name = sound1 sound2 sound3
```
</div>

The `name` of a sound class must be alphanumeric, similar to typical Python
variables, and should not start with a number. The `=`-sign must have a space to the left and to the right. All
sounds (or sound groups referenced by invoking an existing sound class name)
must be separated by a space.

Thus, the following examples for sound class definitions are all *wrong*:

<div class="badcode">

```bash
name=sound1 sound2 sound3
name =sound1 sound2 sound3
name= sound1 sound2 sound3
1name = sound1 sound2 sound3
```

</div>

Internally, a sound class is an ordered list of sounds. By assigning sounds to
a sound class, the sounds are made available to the MISOL system to act
as source and target of sound change processes and to be referenced in sound
laws. In addition to referencing groups of sounds with the help of sound class variables,
all individual ("terminal") sounds are also represented in as sound classes. The difference is that these classes have the same label as the sound iself and that they contain only one element (the sound they refer to).


Furthermore, each final symbol that is identified as a sound
(and not a sound class name) by the MISOL system is also assigned to its own
class with one single manner. Thus, the following line will define as many as 5
internal sound classes, of which four have one single member, and the first
targets the four only sounds in the system.

```
my_class = a b c d
```

Thus, internally, this will result in the following key-value representation:

<div class="mycode">
  
```json
{
  "my_class": ["a", "b", "c", "d"],
  "a": ["a"],
  "b": ["b"],
  "c": ["c"],
  "d": ["d"]
}
```

</div>

When parsing sound laws, MISOL automatically checks for sounds that have not
been referenced in the sound class table and adds them as individual sounds to
the table of sound classes. As a result, you do **not need to define sound
classes in order to define sound laws**. 

In order to check which sound classes have been defined in MISOL, click on the
SHOW CLASSES AND LAWS button, after having inserted your sound class
definitions and your sound laws in the *Classes and Laws* tab. A table will
open and present you all sound classes that have been defined, including both
those classes that you defined actively, as well as those classes that were
inferred automatically from the sound laws you defined.

When you check the sound classes in MISOL, you will see that the list of
classes shows three sound classes in the beginning, which are provided
independently of what you have defined or not. These reserved classes, are the
symbols `^`, `$`, and `-`. `^` refers to the beginning of a sequence and can be
used in the context string of a sound law. The same holds for `$` referring to
the end of a sequence. `-` refers to a specific sound law in which an element
is lost (rather than being replaced by something). It can also be used as a
source sound (in the case of epenthesis, which must be actively modeled) or as
a target sound in a sound law. Other than for this specific purpose, the
symbols should not be used.

Sound classes are a way to model distinctive features that define individual
sounds. The difference between feature-bundle representations for sounds in
sound change models is that features are flexibly defined on the fly, and
modeled rather as "tags" of individual sounds, or a shortcut to reference the
sounds that are tagged with a certain sound class name in an ordered manner. In
our opinion, this comes quite close to the way feature bundles are used
intuitively by linguists so far, since one can define one's sound system in a
convenient manner, and provide major distinctions that may play a role in sound
laws, such as voicing distinctions of consonants:

<div class="mycode">
  
```
voiced = b d g
voiceless = p t k
```

</div>

Another important aspect of sound classes is that they can be used as a
shortcut for a group of sounds in sound laws, which often consist of an
abstract set of independent sound changes, rather than an individual sound
change that occurs in one context alone. As a result, one can refer to both
individual sounds and to sound classes in the sound law descriptions of
MISOL.

As a further note on the way in which sound classes are handled in MISOL,
consider the following assignments:

<div class="mycode">
  
```
voiced = b d g
voiceless = p t k
consonant = voiced voiceless m n ŋ
``` 

</div>

This translates internally to the following major sound class representations:

<div class="mycode">
  
```json
{
  "voiced": ["b", "d", "g"],
  "voiceless": ["p", "t", "k"],
  "consonant": ["b", "d", "g", "p", "t", "k", "m", "n", "ŋ"]
}
```

</div>

Thus, if a sound class like `voiced` has been assigned to a list of sounds, the
label can be reused in order to assign the same group of sounds to another
sound class. Internally, all sound classes are only represented as a group of
terminal sounds, and only sound laws can be reused in assignments if they have
already be defined. As a result, the following order of assignments would be
problematic:

<div class="badcode">
  
```
consonant = voiced voiceless m n ŋ
voiced = b d g
voiceless = p t k
```

</div>

Since `voiced` and `voiceless` have not been introduced yet with their target
group of sounds, the interpreting code of MISOL would treat them as individual
sounds (which can be represented by any string combination, provided it does
not contain a space). Invididual sounds, however cannot be assigned to another
group of sounds, since they are internally assigned to a group of one sound
only, so the program throws a warning here and ignores the corresponding line.

Since MISOL does not care how you define your sounds, it offers the possibility
to work with groups of sounds as well as with individual sounds when dealing
with sound change. In order to make sure that we distinguish groups from
individual sounds, the recommendation is to use a dot `.` between sounds in a
sound sequence in order to indicate that one is not dealing with individual
phonemes. Thus, the final or rhyme of a Chinese word like `[`kwaŋ`]` could then
be conveniently written as `a.ŋ`. MISOL, however, will treat this sequence of
grouped sounds as an individual sound class (potentially a terminal one) and
not assign it a specific semantics. 

Since sound classes are ordered lists of sounds, nothing speaks against it if you assign the same sound multiple times to one and the same sound class. This may be important in cases where *mergers* are described in complex sound laws that deal with more than one input sound. 

There are two symbols which are automatically defined as sounds, which cannot be assigned to sound class groups: `^` represents the beginning of each word and `$` the end. `#` is reserved as a comment marker. 

### 3 Defining Sound Laws (Tab "Classes and Laws")

A sound law is an abstract formula that shows how one or more sounds in an ancestral language are converted to one or more sounds in a descendant language. It has the general formula:

<div class="mycode">

```shell
source > target / context
```

</div>

The number of source sounds and target sounds must be identical and the context is optional and can be omitted:

<div class="mycode">

```shell
source > target
```

</div>


The change marker `>` must be preceded and followed by a space. So the following lines would be erroneous and lead to errors.

<div class="badcode">

```shell
source> target
source >target
source>target
```

</div>

#### 3.1 Source and Target in Sound Laws

Source and target can be either a single sound, sound class, or list of sounds
(indicated by square brackets) or a sequence of sounds. If a sequence of sounds
is provided, this will be interpreted internally by invoking two or more
separate sound laws. Thus, writing

<div class="mycode">

```shell
a b > [c d] / x _ y
```

</div>

is equivalent to writing

<div class="mycode">

```shell
a > c / x _ b y
b > d / x a _ y
```

</div>

Allowing to define consecutive sounds is thus a mere shortcut but it can come
in handy in those cases where it seems difficult to define complex sound laws.


If you pass a sound class, a single sound, or a list of sounds does not make a
difference. Thus, if you have defined a sound class `ptk` as shortcut for the
sounds `p`, `t`, and `k`, the following two statements are equivalent:


<div class="mycode">

```shell
ptk > ptk
[p t k] > [p t k]
```

</div>

The same holds for sequences of sounds:

<div class="mycode">

```shell
ptk ptk > ptk ptk
[p t k] [p t k] > [p t k] [p t k]
```

</div>

Mixing is also possible.

<div class="mycode">

```shell
ptk [p t k] > [p t k] ptk
```

</div>

Note, however, that it is essential that the source and the target always contain the *same amount of sounds* and the *same amount of positions*. If you want to indicate the loss of a sound, use the `-` as gap marker:

<div class="mycode">

```shell
ptk ptk > ptk [- - -]
```

</div>

Note in this example, that you cannot write a single gap symbol, but must
assemble a group (or define a sound class with the group before), since we
require to have one target sound for each source sound and vice versa. This
means also, that you must repeat a sound when using sound class notations to
formulate sound laws, where a merger happens.

<div class="mycode">

```shell
[p t k] > [p p p]
```

</div>

MISOL will in all cases represent sound laws individually, on the basis of one source sound corresponding to one target sound in one individual context. 


#### 3.2 Context in Sound Laws

The context typically has the form:

<div class="mycode">

```shell
left_context _ right_context
```

</div>

Here, `_` represents the source sound. Both left and right context can be omitted.

<div class="mycode">

```shell
left_context _
_ right_context
```

</div>

Context in left and right context is identically defined by a segmental
representation of the sound sequence proceeds to the left in the left context
and to the right in the right context. In this way, theoretically even very
long ranging contexts can be modeled. If one wants to change an `[`s`]`
followed by `[`p, t, k`]` and a vowel to `[`ʃ`]`, one can write:

<div class="mycode">

```shell
s > ʃ / _ [p t k] vowel
```

</div>

Here, the square brackets `[` and `]` are used to indicate that the three
sounds `p`, `t`, and `k` represent a group that can alternatively occur in the
second position following the source sound. A full-fledged toy example that
would model that an `s` becomes voiced when followed by a vowel and turns into
a `ʃ` when followed by a consonant and a vowel, one could define the following
sound classes:

<div class="mycode">

```shell
consonant = p t k b d g s z ʃ
ptk = p t k b d g
vowel = a e i o u
```

</div>

These could then be used in four sound laws:

<div class="mycode">

```shell
s > ʃ / _ [p t k] vowel
s > z / _ vowel
p t k b d g > p t k b d g
vowel > vowel
```

</div>

These would turn a word like `s t a b` into `ʃ t a b` but would turn `s a b` into `z a b`. 


