# -*- coding: utf-8 -*-

import random

#Sets of characters
numerals = [chr(i) for i in range(48,58)]
lowercase_letters = [chr(i) for i in range(97, 123)]
uppercase_letters = [chr(i) for i in range(65, 91)]
separators = ([chr(i) for i in [32, 38, 40, 41, 47, 44, 57, 58, 63]])
specials = [chr(i) for i in range(60, 64)]+[chr(i) for i in range(42,47)]
all = [chr(i) for i in range(1112064)] # all is broken, do not use. It contains illigal characters
                                       # Someone with a genuine interest in utf-8 can fix it

def generate_random_string(string_length,
                           use_all=False,
                           use_num=True,
                           use_letters=True,
                           use_spcecials=False,
                           use_separators=False):
    charset = []
    if use_all:
        charset = all
    else:
        if use_num:
            charset += numerals
        if use_letters:
            charset += lowercase_letters
            charset += uppercase_letters
        if use_spcecials:
            charset += specials
        if use_separators:
            charset += separators



    result = []
    for i in range(string_length):
        number = int(random.random()*len(charset))
        result += charset[number]

    return "".join(result)

def generate_get_payload(api_base,
                         test_location=True,
                         test_time=True,
                         test_method=True,
                         test_sort=True,
                         test_pollutants=True):
    req_string = api_base+"/fetch"
