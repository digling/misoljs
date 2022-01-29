# JavaScript Implementation of Multi-Tier-Based Sound Change

## Description of the Procedure

### 1 Coding Sound Classes

Sound classes are a way to assign sounds to groups. This can be done in an arbitrary fashion, and one and the same sound can be assigned to multiple groups. 

### 2 Coding Sound Laws

Sound laws consist of three components, the source sounds (which can be a class), the target sounds (which can be a class, and should have the same length as the source sounds), and the conditioning context. 

The context itself consists of three components. The left context (all cases where a condition precedes the elementin question), the element itself (typically represented by an underscore `_`), and the right context.

### 3 Representing Sound Laws in Multi-Tiers

We represent conditioning context with the help of vector. The vectors cells are labelled, and each label represents the individual position of the context element, as well as its *tier*. The tier is a way to represent aspects of a sound segment which we cannot directly retrieve from the phonetic transcription. Thus, tone in a language is often represented on vowels or at the end of a syllable, while we know very well that tone is actually a characteristics of a whole syllable or word. To represent tone, the sound sequence should be represented by two sequences, one showing the sound values, and one representing the tone value for the respective syllable. 

Tier | Sequence 
--- | ---
Segments | t ao
Tone | 55 55

As you can see from this example, the tone, here represented as 55 (high flat tone, according to Chao's scale), is assigned to boht the first and the second sound in the syllable in an extra row.

To represent the tiers in sound laws, we take the `Segment` level as our default tier. Additional tiers can be annotated for each sound slot in our context string by using the construct `@tiername:`. 

```
p > b / V @stress:1_

### 4 Applying Sound Laws in Multi-Tiers

Applying a sound law in our multi-tier system is 
