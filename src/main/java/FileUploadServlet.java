
import com.google.gson.Gson;
import org.apache.commons.fileupload.FileItem;
import org.apache.commons.fileupload.FileUploadException;
import org.apache.commons.fileupload.disk.DiskFileItemFactory;
import org.apache.commons.fileupload.servlet.ServletFileUpload;

import java.io.File;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;
import java.text.SimpleDateFormat;
import java.util.Date;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

import javax.servlet.ServletException;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;



public class FileUploadServlet extends HttpServlet {
    /**
     *
     */
    private static final long serialVersionUID = 1L;

    @Override
    protected void doPost(HttpServletRequest req, HttpServletResponse response) throws ServletException, IOException  {
        // modify by tyhuic at 20181126,增加request转码
        req.setCharacterEncoding("UTF-8");
        response.setCharacterEncoding("UTF-8");

        // 服务器存储文件名的规则类型 1:按原文件名存储，2:原文件名+时间戳，3:完全随机16位
        String mode = req.getParameter("saveType");
        String filePathConfig = req.getParameter("filePath");
        // 得到上传文件的保存目录。 将上传的文件存放于WEB-INF目录下，不允许外界直 接访问，保证上传文件的安全
//        String realPath = Configs.get(filePathConfig);
        String realPath = "";
        System.out.println("文件存放位置:" + realPath);
        // 设置临时目录。 上传文件大于缓冲区则先放于临时目录中
        String tempPath = realPath + File.separator + "temp";
        //System.out.println("临时文件存放位置:" + tempPath);

        // 判断存放上传文件的目录是否存在（不存在则创建）
        File f = new File(realPath);
        if (!f.exists() && !f.isDirectory()) {
            //System.out.println("目录或文件不存在! 创建目标目录。");
            f.mkdirs();
        }
        // 判断临时目录是否存在（不存在则创建）
        File f1 = new File(tempPath);
        if (!f1.isDirectory()) {
            //System.out.println("临时文件目录不存在! 创建临时文件目录");
            f1.mkdirs();
        }

        /**
         * 使用Apache文件上传组件处理文件上传步骤：
         *
         * */
        // 1、设置环境:创建一个DiskFileItemFactory工厂
        DiskFileItemFactory factory = new DiskFileItemFactory();

        // 设置上传文件的临时目录
        factory.setRepository(f1);

        // 2、核心操作类:创建一个文件上传解析器。
        ServletFileUpload upload = new ServletFileUpload(factory);
        // 解决上传"文件名"的中文乱码
        upload.setHeaderEncoding("UTF-8");

        // 3、判断enctype:判断提交上来的数据是否是上传表单的数据
        if (!ServletFileUpload.isMultipartContent(req)) {
            //System.out.println("不是上传文件，终止");
            // 按照传统方式获取数据
            return;
        }

        // ==获取输入项==
        // //限制单个上传文件大小(5M)
        // upload.setFileSizeMax(1024*1024*4);
        // //限制总上传文件大小(10M)
        // upload.setSizeMax(1024*1024*6);

        // 4、使用ServletFileUpload解析器解析上传数据，解析结果返回的是一个List<FileItem>集合，每一个FileItem对应一个Form表单的输入项
        Map<String, Object> msg = new HashMap<String, Object>();
        InputStream in = null;
        OutputStream out = null;
        Gson gson = new Gson();
        List<FileItem> items = null;
        try {
            items = upload.parseRequest(req);
        } catch (FileUploadException e) {
            e.printStackTrace();
        }
        for (FileItem item : items) {
            // 如果fileitem中封装的是普通输入项的数据（输出名、值）
            if (item.isFormField()) {
                String filedName = item.getFieldName();// 普通输入项数据的名
                // 解决普通输入项的数据的中文乱码问题
                String filedValue = item.getString("UTF-8");// 普通输入项的值
                System.out.println("普通字段:" + filedName + "==" + filedValue);
            } else {
                // 如果fileitem中封装的是上传文件，得到上传的文件名称，
                String fileName = item.getName();// 上传文件的名
                // 多个文件上传输入框有空 的 异常处理
                if (fileName == null || "".equals(fileName.trim())) { // 去空格是否为空
                    continue;// 为空，跳过当次循环， 第一个没输入则跳过可以继续输入第二个
                }

                // 注意：不同的浏览器提交的文件名是不一样的，有些浏览器提交上来的文件名是带有路径的，如：
                // c:\a\b\1.txt，而有些只是单纯的文件名，如：1.txt
                // 处理上传文件的文件名的路径，截取字符串只保留文件名部分。//截取留最后一个"\"之后，+1截取向右移一位（"\a.txt"-->"a.txt"）
                fileName = fileName.substring(fileName
                        .lastIndexOf(File.separator) + 1);
                // 拼接上传路径。存放路径+上传的文件名
                String serverName = "";
                String filePrefix = fileName.substring(0,
                        fileName.indexOf("."));
                String fileSuffix = fileName.substring(fileName
                        .indexOf("."));
                switch (mode) {
                    case "1":
                        serverName = fileName;
                        break;
                    case "2":
                        serverName = filePrefix
                                + "_"
                                + new SimpleDateFormat("yyyyMMddHHmmss")
                                .format(new Date()) + fileSuffix;
                        break;
                    case "3":
                        serverName = UUID.randomUUID().toString()
                                .replace("-", "").substring(16)
                                + fileSuffix;
                        break;
                    default:
                        break;
                }
                // 构建输入输出流
                in = item.getInputStream(); // 获取item中的上传文件的输入流
                // modify by tyhuic at 20181126,修改此处文件存放路径
                out = new FileOutputStream(realPath + File.separator
                        + serverName); // 创建一个文件输出流

                // 创建一个缓冲区
                byte b[] = new byte[1024];
                // 判断输入流中的数据是否已经读完的标识
                int len = -1;
                // 循环将输入流读入到缓冲区当中，(len=in.read(buffer))！=-1就表示in里面还有数据
                while ((len = in.read(b)) != -1) { // 没数据了返回-1
                    // 使用FileOutputStream输出流将缓冲区的数据写入到指定的目录(savePath+"\\"+filename)当中
                    out.write(b, 0, len);
                }
                // modify by tyhuic at 20181126,增加服务器上传完成文件路径的回显
                msg.put("serverpath", realPath + File.separator
                        + serverName);

                msg.put("servername", serverName);
                msg.put("localname", fileName);
                msg.put("message", "文件上传成功!");
                msg.put("code", "1");
                response.getWriter().write(gson.toJson(msg));
                item.delete();// 删除处理文件上传时生成的临时文件
                System.out.println("文件上传成功");
            }
        }
        if (in != null) {
            in.close();
        }
        if (out != null) {
            out.close();
        }
    }

    @Override
    protected void doGet(HttpServletRequest req, HttpServletResponse resp)
            throws ServletException, IOException {
        this.doPost(req, resp);
    }
}