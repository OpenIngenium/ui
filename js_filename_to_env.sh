#!/bin/bash

################################################################################
#A valid JS bundle file should have the following format:                      #
#                                                                              #
#    <filename>-<hash>-bundle.js                                               #
#                                                                              #
#For every JS bundle file in /src/client/dist, extract the filename and convert#
#it to the following format:                                                   #
#                                                                              #
#   export <filename>_JS_BUNDLE=<path_to_file>/<filename>-<hash>-bundle.js     #
#                                                                              #
#The converted line should be append to the file provided by user as an argume-#
#nt to this script at cli (see example below). The provided file should be     #
#either empty or nonexistent.                                                  #
#                                                                              #
#   ./js_filename_to_env.sh <path_to_look_for_js_bundle> <output_filename>     #
################################################################################

if [[ $# -lt 2 ]]; then
    echo "Need the name of the file to output to"
    exit 0
fi

echo '#!/bin/bash' >> $2

for file in $1/*; do
    if [[ ${file##*/} == *bundle* ]]; then
        IFS="-" tokens=( ${file##*/} )
        token_len=${#tokens[@]}
        if [ ${token_len} -gt 2 ]; then
            filename=''
            for (( i=0; i<$((token_len-2)); ++i )); do
                if [[ ${filename} == '' ]]; then
                    filename=${tokens[i]}
                else
                    filename=${filename}_${tokens[i]}
                fi
            done

            IFS=""
            echo export ${filename^^}_JS_BUNDLE=${file##*/} >> $2
            IFS="-"
        fi
    fi
done

