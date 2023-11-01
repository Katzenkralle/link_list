from django.shortcuts import render
from django.http import HttpResponse, JsonResponse
from django.views import View

from .ascii_color import AsciiInColor
import os

class imgToAscii(View):
    def get(self, request):
        user = request.user
        img_name = request.GET.get('name', None)
        adjust_width = float(request.GET.get('adjustWidth', 2))
        output_width = int(request.GET.get('outputWidth', 64))
        output_height = int(request.GET.get('outputHeight', 64))
        ignore_brightness = int(request.GET.get('ignoreBrightness', 255))
        colorize_output = request.GET.get('colorizeOutput', 'fb')
        invert_brightness = request.GET.get('invertBrightness', 'false') == "true"
        only_use_blocks = request.GET.get('onlyUseBlocks', 'false') == "true"
        download = request.GET.get('download', 'false') == "true"



        if not img_name:
            return JsonResponse({'status': 'Error! No image name provided'})

        img_path = os.path.join(os.getcwd(), f"ll_web/data/{user.id}/media/{img_name}")
        img = AsciiInColor(img_path, (output_width, output_height), adjust_width)
        img.open_and_prepare()
        if only_use_blocks:
            img.convert_to_block(ignore_brightness, invert_brightness)
        else:                
            img.convert_to_ascii(ignore_brightness, invert_brightness, "f" in colorize_output or "b" in colorize_output)

        if download: 
            response = HttpResponse(img.write_to_str(colorize_output), content_type='text/plain')
            response['Content-Disposition'] = f'attachment; filename="{img_name}.txt"'
            return response

        return JsonResponse({'status': 'success',
                            'transformed_img': img.ascii_img, 
                            "colorized": colorize_output,
                            "inverted": invert_brightness,
                            "only_use_blocks": only_use_blocks,
                            "ignore_brightness": ignore_brightness})
