var at;
(function (at) {
    (function (jku) {
        (function (ssw) {
            (function (Coco) {
                var FileStream = (function () {
                    function FileStream() { }
                    FileStream.prototype.ReadCharacter = function () {
                        // TODO
                        return "\0";
                    };
                    return FileStream;
                })();
                Coco.FileStream = FileStream;                
                var StreamWriter = (function () {
                    function StreamWriter() { }
                    StreamWriter.prototype.Write = function (s) {
                    };
                    StreamWriter.prototype.WriteLineText = function (s) {
                        // TODO
                                            };
                    StreamWriter.prototype.WriteFormatted1 = function (format, o1) {
                        // TODO
                                            };
                    StreamWriter.prototype.WriteLineFormatted1 = function (format, o1) {
                        // TODO
                                            };
                    StreamWriter.prototype.WriteLineFormatted2 = function (format, o1, o2) {
                        // TODO
                                            };
                    StreamWriter.prototype.WriteLine = function () {
                        // TODO
                                            };
                    StreamWriter.prototype.Close = function () {
                        // TODO
                                            };
                    return StreamWriter;
                })();
                Coco.StreamWriter = StreamWriter;                
                var StringWriter = (function () {
                    function StringWriter() { }
                    return StringWriter;
                })();
                Coco.StringWriter = StringWriter;                
                var TextWriter = (function () {
                    function TextWriter() { }
                    TextWriter.prototype.WriteLine = function () {
                        // TODO
                                            };
                    TextWriter.prototype.WriteLineText = function (s) {
                        // TODO
                                            };
                    TextWriter.prototype.Write = function (s) {
                        // TODO
                                            };
                    TextWriter.prototype.WriteFormatted1 = function (format, o1) {
                        // TODO
                                            };
                    return TextWriter;
                })();
                Coco.TextWriter = TextWriter;                
                var BitArray = (function () {
                    function BitArray(size) {
                        // TODO:
                                            }
                    BitArray.prototype.Or = function (other) {
                        // TODO:
                                            };
                    return BitArray;
                })();
                Coco.BitArray = BitArray;                
                var StringBuilder = (function () {
                    function StringBuilder(s) {
                        // TODO
                                            }
                    StringBuilder.prototype.AppendNumber = function (n) {
                        // TODO
                                            };
                    Object.defineProperty(StringBuilder.prototype, "length", {
                        get: function () {
                            // TODO
                            return 0;
                        },
                        enumerable: true,
                        configurable: true
                    });
                    StringBuilder.prototype.toString = function () {
                        // TODO
                        return "";
                    };
                    return StringBuilder;
                })();
                Coco.StringBuilder = StringBuilder;                
            })(ssw.Coco || (ssw.Coco = {}));
            var Coco = ssw.Coco;
        })(jku.ssw || (jku.ssw = {}));
        var ssw = jku.ssw;
    })(at.jku || (at.jku = {}));
    var jku = at.jku;
})(at || (at = {}));
//@ sourceMappingURL=Util.js.map
