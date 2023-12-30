# Multi-Tiered Sound Laws in MISOL: Specification

## Components

MISOL defines sound laws in two tables, one table that defines *sound classes* and one table that defines *sound laws*. *Sound classes* serve two main purposes: on the one hand, they allow to define the sounds in the ancestral and the descendant language, on the other hand, they allow for a simple system by which sounds can be grouped into ordered lists and tagged by certain features.

## Table of Sound Classes

This table defines sounds in a very simple way, by assigning one or more sounds or sound classes to a certain sound class label on each line. Sound classes are read in from the first to the last line and definitions are stored at the time a line is parsed. As a result, sound class assignments can be combined, and an existing sound class can be assigned to another class.

The assignment of one or more sounds or sound classes to a given sound class is represented in the form:

```
name = sound1 sound2 sound3
```

The `name` of a sound class must be alphanumeric, similar to typical Python variables. The `=`-sign must have a space to the left and to the right. All sounds (or sound groups referenced by invoking an existing sound class name) must be separted by a space.

Internally, a sound class is an ordered list of sounds. By assigning sounds ot a sound class, the sounds are also made available for the MISOL system to act as source and target of sound change processes and to be referenced in sound laws. The sound class assignment is therefore also used in order to define the individual sounds from ancestral and descendant language. If no sound class assignments are provided, the MISOL system does not know what sounds to change and won't work. Furthermore, each final symbol that is identified as a sound (and not a sound class name) by the MISOL system is also assigned to its own class with one single manner. Thus, the following line will define as many as 5 internal sound classes, of which four have one single member, and the first targets the four only sounds in the system.

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

Sound classes are a way to model distinctive features that define individual sounds. The difference between feature-bundle representations for sounds in sound change models is that features are flexibly defined on the fly, and modeled rather as "tags" of individual sounds, or a shortcut to reference the sounds that are tagged with a certain sound class name in an ordered manner. In our opinion, this comes quite close to the way feature bundles are used intuitively by linguists so far, since one can define one's sound system in a convenient manner, and provide major distinctions that may play a role in sound laws, such as voicing distinctions of consonants:

<div class="mycode">
  
```
voiced = b d g
voiceless = p t k
```

</div>

Another important aspect of sound classes is that they can be used as a shortcut for a group of sounds in sound laws, which often consist of an abstract set of independent sound changes, rather than an individual sound change that occurs in one context alone. As a result, one can refer to both individual sounds and to sound classes in the sound law descriptions of MISOL.

As a further note on the way in which sound classes are handled in MISOL, consider the following assignments:

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

Thus, if a sound class like `voiced` has been assigned to a list of sounds, the label can be reused in order to assign the same group of sounds to another sound class. Internally, all sound classes are only represented as a group of terminal sounds, and only sound laws can be reused in assignments if they have already be defined. As a result, the following order of assignments would be problematic:

<div class="mycode">
  
```
consonant = voiced voiceless m n ŋ
voiced = b d g
voiceless = p t k
```

</div>

Since `voiced` and `voiceless` have not been introduced yet with their target group of sounds, the interpreting code of MISOL would treat them as individual sounds (which can be represented by any string combination, provided it does not contain a space). Invididual sounds, however cannot be assigned to another group of sounds, since they are internally assigned to a group of one sound only, so the program +++should+++ throw an error here, given that the re-assignment of one sound class to another set of sounds is not allowed.

Since MISOL does not care how you define your sounds, it offers the possibility to work with groups of sounds as well as with individual sounds when dealing with sound change. In order to make sure that we distinguish groups from individual sounds, the recommendation is to use a dot `.` between sounds in a sound sequence in order to indicate that one is not dealing with individual phonemes. Thus, the final or rhyme of a Chinese word like `[`kwaŋ`]` could then be conveniently written as `a.ŋ`. 

Since sound classes are ordered lists of sounds, nothing speaks against it if you assign the same sound multiple times to one and the same sound class. This may be important in cases where *mergers* are described in complex sound laws that deal with more than one input sound. 

There are two symbols which are automatically defined as sounds, which cannot be assigned to sound class groups: `^` represents the beginning of each word and `$` the end. `#` is reserved as a comment marker. 

## Sound Laws: Basic Structure

A sound law is an abstract formula that shows how one or more sounds in an ancestral language are converted to one or more sounds in a descendant language. It has the general formula:

```
source > target / context
```

The number of source sounds and target sounds must be identical and the context is optional and can be omitted:

```
source > target
```

The change marker `>` must be preceded and followed by a space. 
 
### Source and Target in Sound Laws

Source and target can be either a single sound, sound class, or list of sounds (indicated by square brackets) or a sequence of sounds. If a sequence of sounds is provided, this will be interpreted internally by invoking two or more separate sound laws. Thus, writing

```
a b > c d / x _ y
```

is equivalent to writing

```
a > c / x _ b y
b > d / x a _ y
```

Allowing to define consecutive sounds is thus a mere shortcut but it can come in handy in those cases where it seems difficult to define complex sound laws. 

If you pass a sound class, a single sound, or a list of sounds does not make a difference. Thus, if you have defined a sound class `ptk` as shortcut for the sounds `p`, `t`, and `k`, the following two statements are equivalent:

```
ptk > ptk
[p t k] > [p t k]
```

The same holds for sequences of sounds:

```
ptk ptk > ptk ptk
[p t k] [p t k] > [p t k] [p t k]
```

Mixing is also possible.

```
ptk [p t k] > [p t k] ptk
```

Note, however, that it is essential that the source and the target always contain the *same amount of sounds* and the *same amount of positions*. If you want to indicate the loss of a sound, use the `-` as gap marker:

```
ptk ptk > ptk [- - -]
```

Note in this example, that you cannot write a single gap symbol, but must assemble a group (or define a sound class with the group before), since we require to have one target sound for each source sound and vice versa. This means also, that you must repeat a sound when using sound class notations to formulate sound laws, where a merger happens.

```
[p t k] > [p p p]
```

MISOL will in all cases represent sound laws individually, on the basis of one source sound corresponding to one target sound in one individual context. 


### Context in Sound Laws

The context typically has the form:

```
left_context _ right_context
```

Here, `_` represents the source sound. Both left and right context can be omitted.

```
left_context _
_ right_context
```

Context in left and right context is identically defined by a segmental representation of the sound sequence proceeds to the left in the left context and to the right in the right context. In this way, theoretically even very long ranging contexts can be modeled. If one wants to change an `[`s`]` followed by `[`p, t, k`]` and a vowel to `[`ʃ`]`, one can write:

```
s > ʃ / _ [p t k] vowel
```

Here, the square brackets `[` and `]` are used to indicate that the three sounds `p`, `t`, and `k` represent a group that can alte
rnatively occur in the second position following the source sound. A full-fledged toy example that would model that an `s` becomes voiced when followed by a vowel and turns into a `ʃ` when followed by a consonant and a vowel, one could define the following sound classes:

```
consonant = p t k b d g s z ʃ
ptk = p t k b d g
vowel = a e i o u
```

These could then be used in four sound laws:

```
s > ʃ / _ [p t k] vowel
s > z / _ vowel
p t k b d g > p t k b d g
vowel > vowel
```

These would turn a word like `s t a b` into `ʃ t a b` but would turn `s a b` into `z a b`. 


