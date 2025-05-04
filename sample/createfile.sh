#!/bin/bash -x
#
#  Copyright 2025 agwlvssainokuni
#
#  Licensed under the Apache License, Version 2.0 (the "License");
#  you may not use this file except in compliance with the License.
#  You may obtain a copy of the License at
#
#      http://www.apache.org/licenses/LICENSE-2.0
#
#  Unless required by applicable law or agreed to in writing, software
#  distributed under the License is distributed on an "AS IS" BASIS,
#  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
#  See the License for the specific language governing permissions and
#  limitations under the License.
#

basedir=$(dirname ${BASH_SOURCE[0]})

mkdir -p ${basedir}/0file/aaa
mkdir -p ${basedir}/0file/bbb
mkdir -p ${basedir}/1arch
mkdir -p ${basedir}/2back

dd if=/dev/urandom count=1 | base64 -w 76 > ${basedir}/0file/aaa/foreach_$(date +%Y%m%d%H%M%S).txt
dd if=/dev/urandom count=1 | base64 -w 76 >  ${basedir}/0file/aggregate_1.txt
dd if=/dev/urandom count=1 | base64 -w 76 >  ${basedir}/0file/aaa/aggregate_2.txt
dd if=/dev/urandom count=1 | base64 -w 76 >  ${basedir}/0file/bbb/aggregate_3.txt
