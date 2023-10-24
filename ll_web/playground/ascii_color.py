from PIL import Image, ImageOps
from typing import Tuple
from sty import RgbBg, RgbFg, Style, bg, fg

class ImageReader():
    def __init__(self, img_path, downsample_size):
        self.img_path = img_path
        self.downsample_size = downsample_size
        self.img = None

    def read_image(self):
        #Returns a PIL Image object for the image at the given path
        self.img = Image.open(self.img_path)
        return

    def sample_image(self):
        #Samples the image to the given size (upsamplling possible)
        self.img = ImageOps.contain(self.img, self.downsample_size)



class AsciiInColor(ImageReader):
    ascii_gray = " .'`^,:;Il!i><~+_-?][1)(|\/tfjrxnuvczXYUJCLQ0OZmwqpdbkhao*#MW$&8%B@"

    def __init__(self, img_path, sample_size: Tuple[int, int], ajust_for_char_size: int = 1, \
                  force_sample: bool = False):
        super().__init__(img_path, sample_size)
        self.aimed_size = sample_size
        self.force_sample = force_sample
        self.ajust_for_char_size = ajust_for_char_size
        self.ascii_img = None
        self.is_colorized = False
        self.inverted = False

    def open_and_prepare(self):
        #Opens the image and samples it if needed
        #Stretches the image to fit the char size by given factor
        #Converts the image to RGBA color mode
        self.read_image()
        if 0 in self.aimed_size:
            self.aimed_size = (self.img.size[0], self.img.size[1])
            self.downsample_size = self.aimed_size
        
        self.img = self.img.resize((int(self.img.size[0] * self.ajust_for_char_size), self.img.size[1]))
        if self.img.size > (self.aimed_size[0], self.aimed_size[1]) or self.force_sample:
            self.sample_image()
        self.img = self.img.convert("RGBA")
        return 
    
    def get_brightness(self, pixel):
        #Returns the brightness of the pixel
        #(Alpha is taken into account, possibly not the best way to do it)
        #https://en.wikipedia.org/wiki/Relative_luminance
        R, G, B, A = pixel
        brightness = ((0.2126*R + 0.7152*G + 0.0722*B)/255)*(A/255)
        brightness = round(brightness, 7)
        return brightness

    def colorizer(self, pixel, brightness, ignore_white_threshold = 0):
        #Returns the color of the pixel, inverted if needed
        #Returns transparent if the pixel is above the ignore_white_threshold
        if brightness > ignore_white_threshold:
            return (0, 0, 0, 0)
        color = (int(abs(pixel[0]-255)), int(abs(pixel[1] -255)), int(abs(pixel[2]-255)), brightness*255) \
            if self.inverted else pixel
        
        #This is a hack to make the background not transparent for inverted images with ignore_white_threshold underset
        if ignore_white_threshold == 1 and self.inverted:
            return (color[:3] + (255,))
        return color

    def convert_to_ascii(self, ignore_white_threshold:int = 255, invert_brightness:bool = False, colorize:bool = False):
        #Converts the image to ascii art, colorize if needed
        result = []
        self.inverted = invert_brightness
        ignore_white_threshold /= 255
      
        for pixel, possition in zip(list(self.img.getdata()),\
                                    range(0, self.img.size[0] * self.img.size[1])):
            #Iterates over the pixels and converts them to ascii
            #Every row is a list in the result list
            if possition % self.img.size[0] == 0:
                result.append([])
            
            #Calculates the brightness of the pixel, inverts it if needed
            brightness = self.get_brightness(pixel)
            brightness = 1 - brightness if invert_brightness else brightness
            
            #Calculates the index of the ascii char, if the brightness is above the ignore_white_threshold
            #the char is set to the first char in the ascii_gray list meaning it is whitespace
            if (brightness > ignore_white_threshold):
                ascii_char_index = 0
            else:
                #Calculates the index of the ascii char based on the brightness
                # e.g. 0.5 * (67 - 1) = 0.5 * 66 = 33; 0 * (67 - 1) = 0; 1 * (67 - 1) = 66
                ascii_char_index = int(brightness * (len(AsciiInColor.ascii_gray)-1))
            
            if colorize:
                #If colorize is set to True, the pixel is colorized and appended to the result list
                #Every char is a list with the char and the color as RGBA tuple
                result[-1].append([AsciiInColor.ascii_gray[ascii_char_index], \
                                  self.colorizer(pixel, brightness, ignore_white_threshold)])
            else:
                #If colorize is set to False, the pixel is appended to the result list, no color
                result[-1].append(AsciiInColor.ascii_gray[ascii_char_index])

        self.is_colorized = colorize
        self.ascii_img = result
        return
    
    def convert_to_block(self, ignore_white_threshold:int = 255, invert_brightness:bool = False):
        #Converts the image to block art
        #Symular to convert_to_ascii, but every char is a block
        #ToDo: Remove duplicate code, merge with convert_to_ascii
        result = []
        self.inverted = invert_brightness
        ignore_white_threshold /= 255
        
        for pixel, possition in zip(list(self.img.getdata()),\
                                    range(0, self.img.size[0] * self.img.size[1])):
            if possition % self.img.size[0] == 0:
                result.append([])
            brightness = self.get_brightness(pixel)
            brightness = 1 - brightness if invert_brightness else brightness

            result[-1].append(["█", self.colorizer(pixel, brightness, ignore_white_threshold)])
        
        self.is_colorized = True
        self.ascii_img = result
        return

    def write_to_str(self, colorize_part: str = "False") -> str:
        result = ""
        for row in self.ascii_img:
            if not self.is_colorized:
                result += "".join(row) + "\n"
            else:
                for char, rgba in row:
                    if rgba == (0, 0, 0, 0):
                        result += " "
                    else:
                        bg.char_color = Style(RgbBg(rgba[0], rgba[1], rgba[2]))
                        fg.char_color = Style(RgbFg(rgba[0], rgba[1], rgba[2]))
                        if "b" in colorize_part and "f" in colorize_part:
                            result += bg.char_color + fg.char_color + char
                        elif "b" in colorize_part:
                            result += bg.char_color + char
                        else:
                            result += fg.char_color + char
                result += "\n"
        return result
                
    
def add_argphraser():
    #Adds the command line arguments and returns them
    parser = argparse.ArgumentParser(description='Convert image to ascii art')
    parser.add_argument('image_path', type=str, help='Path to image')
    parser.add_argument('size', type=str, help='Size of the output image (in lines) WxH')
    parser.add_argument('--adjust_for_char_size', type=int, default=2, help='Adjust image size for char size')
    parser.add_argument('--invert_brightness', default=False, action='store_true', help='Invert brightness')
    parser.add_argument('--ignore_white_threshold', default=255 ,type=int, help='Ignore white threshold/(or black if inverted)')
    parser.add_argument('--colorize', type=str, default="False", help='Colorize output (False/fb/f/b)')
    parser.add_argument('--block', action='store_true', default=False, help='Convert to block')
    return parser.parse_args()

if __name__ == "__main__":
    #Example usage for comando line
    
    import argparse
    cmd_args = add_argphraser()
    try:
        w = int(cmd_args.size.split("x")[0])
        h = int(cmd_args.size.split("x")[1])
        img = AsciiInColor(cmd_args.image_path, (w, h), int(cmd_args.adjust_for_char_size))
        img.open_and_prepare()
        if cmd_args.block:
            img.convert_to_block(cmd_args.ignore_white_threshold, cmd_args.invert_brightness)
        else:
            img.convert_to_ascii(cmd_args.ignore_white_threshold, cmd_args.invert_brightness, cmd_args.colorize != "False")
        img.print_ascii_img(cmd_args.colorize)
    except Exception as e:
        print("An error occurred: ", e)
